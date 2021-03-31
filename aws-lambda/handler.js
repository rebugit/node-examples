'use strict';

const uuid = require('uuid');
const axios = require('axios');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager({
    region: process.env.AWS_REGION
});

const getApiKey = async () => {
    const resp = await secretsManager.getSecretValue({SecretId: process.env.SECRET_NAME}).promise()
    return resp.SecretString;
}

const getCity = async (lat, lon, apiKey) => {
    const resp = await axios({
        method: 'get',
        url: `https://www.mapquestapi.com/geocoding/v1/reverse?key=${apiKey}&location=${lat}%2C${lon}&outFormat=json&thumbMaps=false`
    })

    return {
        city: resp.data.results[0].location[0].adminArea5,
        address: resp.data.results[0].location[0].street
    }
}

const weather = async (lat, long) => {
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
            return " ☁"
        default:
            return "⛈"
    }
}

module.exports.hello = async (event) => {
    try {
        const data = JSON.parse(event.body);

        if (data.lat === "" || data.long === "") {
            throw new Error("latitude or longitude is missing")
        }

        if (data.forecast === "") {
            throw new Error("forecast is missing")
        }

        const apiKey = await getApiKey();
        const city = await getCity(data.lat, data.long, apiKey)
        const forecast = await weather(data.lat, data.long)
        const id = await storeForecast(forecast, city)
        const result = await getForecast(id)
        const weather = getWeatherEmoji(result, data.forecast)
        // create a response
        return {
            statusCode: 200,
            body: JSON.stringify({
                forecast: weather,
                position: result.city
            }),
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        }
    }
}
