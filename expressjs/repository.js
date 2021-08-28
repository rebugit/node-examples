const axios = require('axios');
const AWS = require('aws-sdk');
const {DataTypes} = require("sequelize");

class TodoRepository {
  constructor(db) {
    this.db = db
  }

  async findAll() {
    return this.db.Todo.findAll({
      include: [
        {
          model: this.db.Address
        },
        {
          model: this.db.WeatherForecast
        }
      ]
    });
  }

  async createWithT(todo, t) {
    return this.db.Todo.create(todo, {transaction: t})
  }

  async update() {
  }

  async deleteById(todoId) {
    return this.db.Todo.destroy({where: {id: todoId}})
  }

  async startT(transactionCb) {
    return this.db.sequelize.transaction(transactionCb)
  }
}

class PositionRepository {
  constructor(db) {
    this.db = db
  }

  async getLocationByCity(city, apiKey) {
    const url = `https://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${city}`
    const resp = await axios({
      method: 'get',
      url
    })

    return {
      latitude: resp.data.results[0].locations[0].latLng.lat,
      longitude: resp.data.results[0].locations[0].latLng.lng,
    }
  }

  async createLocationWithT(location, todoId, addressId, t) {
    return this.db.Location.create({
      latitude: location.latitude,
      longitude: location.longitude,
      todo_id: todoId,
      address_id: addressId
    }, {transaction: t})
  }

  async createAddressWithT(address, todoId, t) {
    return this.db.Address.create({...address, todo_id: todoId}, {transaction: t})
  }

  async getAddressByLocation(lat, lon, apiKey) {
    const url = `https://www.mapquestapi.com/geocoding/v1/reverse?key=${apiKey}&location=${lat}%2C${lon}&outFormat=json&thumbMaps=false`
    const resp = await axios({
      method: 'get',
      url
    })

    return {
      city: resp.data.results[0].locations[0].adminArea5,
      address: resp.data.results[0].locations[0].street,
    }
  }
}

class WeatherForecastRepository {
  constructor(db) {
    this.db = db
  }

  getByPosition = async (lat, long) => {
    const resp = await axios({
      method: "get",
      url: `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${long}`,
    })

    const forecast = {}

    resp.data.properties.timeseries.forEach(obj => {
      // Sometimes one forecast is not present, so we pick the first available
      const weather = obj.data.next_1_hours || obj.data.next_6_hours || obj.data.next_12_hours
      if (!weather) {
        return
      }
      const code = weather.summary.symbol_code
      forecast[obj.time] = {
        time: obj.time,
        weather: {
          code,
          detail: weather.details,
          emoji: WeatherForecastRepository.getWeatherEmoji(code)
        }
      }
    })
    return forecast
  }

  getAtLocationAndDate = async (location, date) => {
    // this is the isoDate format: 2021-08-26T02:25:25.035Z"
    // we have to transform it into: 2021-08-26T02:00:00Z"
    const isoDate = new Date(date).toISOString()
    const time = isoDate.split(':')[0] + ":00:00Z";
    const forecast = await this.getByPosition(location.latitude, location.longitude);
    return forecast[time]
  }

  createWithT = async (weather, todoId, locationId, t) => {
    return this.db.WeatherForecast.create({
      location_id: locationId,
      todo_id: todoId,
      time: weather.time,
      weather: weather.weather
    }, {transaction: t})
  }

  static getWeatherEmoji = (symbolCode) => {
    switch (symbolCode) {
      case "partlycloudy_day":
        return "🌤";
      case "fair":
      case "fair_day":
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

module.exports = {
  TodoRepository,
  WeatherForecastRepository,
  PositionRepository,
  AWSServicesRepository
}