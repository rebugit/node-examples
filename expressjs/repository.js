const axios = require('axios');
const AWS = require('aws-sdk');

class TodoRepository {
  async findAll() {
  }

  async create() {
  }

  async update() {
  }

  async deleteById() {
  }
}

class WeatherForecastRepository {
  getByPosition = async (lat, long) => {
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

  getWeatherEmoji = (result, forecastType) => {
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
}

class LocationRepository {
  async getCity(lat, lon, apiKey) {
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
}

class AWSServicesRepository {
  constructor() {
    this.secretsManager = new AWS.SecretsManager({
      region: process.env.AWS_REGION
    });
  }

  getSecretManagerApiKey = async () => {
    const resp = await this.secretsManager.getSecretValue({SecretId: process.env.SECRET_NAME}).promise()
    return JSON.parse(resp.SecretString).apiKey;
  }
}