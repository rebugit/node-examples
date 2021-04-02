'use strict';

const uuid = require('uuid');
const axios = require('axios');
const AWS = require('aws-sdk');
const {RebugitSDK} = require('rbi-nodejs-agent');

const rbi = new RebugitSDK({
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiIzMTI3ODc1MC05NDUyLTQ4OGYtODNjNy1mYTYxZDcxZDcxZTQiLCJ0ZW5hbnRJZCI6IjFjNjJiZDc0LTQwMTYtNDBkZS1hNGJhLTZmMGZkYWU1ZjBmNyJ9.IYLawG70gdl5D3_OHZVV65KG0OEMh-CnqFBKbzEKoqo',
    collector: {
        collectorBaseUrl: "dev.api.rebugit.com"
    }
})
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager({
    region: process.env.AWS_REGION
});

const getApiKey = async () => {
    const resp = await secretsManager.getSecretValue({SecretId: process.env.SECRET_NAME}).promise()
    return JSON.parse(resp.SecretString).apiKey;
}

const getCity = async (lat, lon, apiKey) => {
    const url = `https://www.mapquestapi.com/geocoding/v1/reverse?key=${apiKey}&location=${lat}%2C${lon}&outFormat=json&thumbMaps=false`
    const resp = await axios({
        method: 'get',
        url
    })

    return {
        city: resp.data.results[0].locations[0].adminArea5,
        address: resp.data.results[0].locations[0].street
    }
}

const getForecastWeather = async (lat, long) => {
    const resp = await axios({
        method: "get",
        url: `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${long}`,
    })

    const forecast = resp.data.properties.timeseries[0]
    return {
        time: forecast.time,
        forecast: forecast.data
    }
}

const storeForecast = async (forecast, city) => {
    const id = uuid.v1()
    const timestamp = new Date().getTime();
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            id,
            data: forecast.forecast,
            time: forecast.time,
            city,
            createdAt: timestamp,
            updatedAt: timestamp,
        },
    };

    await dynamoDb.put(params).promise()
    return id
}

const getForecast = async (id) => {
    const response = await dynamoDb.get({
        TableName: process.env.DYNAMODB_TABLE,
        ConsistentRead: true,
        Key: {
            id
        }
    }).promise()
    return response.Item
}

const getWeatherEmoji = (result, forecastType) => {
    const symbolCode = result.data[forecastType].summary.symbol_code;
    switch (symbolCode){
        case "partlycloudy_day":
            return "🌤";
        case "fair":
        case "clearsky_day":
            return "🌞"
        case "cloudy_day":
        case "cloudy":
            return " ☁"
        default:
            return "⛈"
    }
}

module.exports.getWeather = rbi.AWSLambda().lambdaHandler(async (event) => {
    try {
        const data = JSON.parse(event.body);
        console.log(JSON.stringify(data, null, 2))
        if (data.lat === "" || data.long === "") {
            throw new Error("latitude or longitude is missing")
        }

        if (data.forecast === "") {
            throw new Error("forecast is missing")
        }

        const apiKey = await getApiKey();
        console.log("got api key")

        const city = await getCity(data.lat, data.long, apiKey)
        console.log(JSON.stringify(city, null, 2))

        const forecast = await getForecastWeather(data.lat, data.long)
        console.log(JSON.stringify(forecast, null, 2))

        const id = await storeForecast(forecast, city)
        const result = await getForecast(id)
        console.log(JSON.stringify(result, null, 2))

        const weather = getWeatherEmoji(result, data.forecast)
        console.log("Weather: ", weather)
        // create a response
        return {
            statusCode: 200,
            body: JSON.stringify({
                forecast: weather,
                position: result.city
            }),
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
        };
    } catch (e) {
        console.log(e.message)
        console.log(e.stack)
        return {
            statusCode: 500,
            body: e.message,
            headers: {
                "Access-Control-Allow-Origin" : "*"
            },
        }
    }
})
