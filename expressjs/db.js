const {Sequelize, DataTypes} = require("sequelize");
const {WeatherForecastRepository} = require("./repository");
const {DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME} = process.env
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

const Todo = sequelize.define("todo", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  task: DataTypes.TEXT,
  date: DataTypes.TEXT,
  isCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const Address = sequelize.define("address", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  city: DataTypes.TEXT,
  address: DataTypes.TEXT,
})

const Location = sequelize.define("location", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  latitude: DataTypes.TEXT,
  longitude: DataTypes.TEXT
});

const WeatherForecast = sequelize.define("weather", {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  time: DataTypes.TEXT,
  weather: DataTypes.JSONB
});

Todo.hasOne(Address, {foreignKey: 'todo_id', onDelete: 'cascade'});
Todo.hasOne(Location, {foreignKey: 'todo_id', onDelete: 'cascade'});
Todo.hasOne(WeatherForecast, {foreignKey: 'todo_id', onDelete: 'cascade'});
Address.hasOne(Location, {foreignKey: 'address_id', onDelete: 'cascade'});
Location.hasOne(WeatherForecast, {foreignKey: 'location_id', onDelete: 'cascade'});


async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync({force: true});
  await Todo.create({
    task: "Go fishing",
    date: new Date().toISOString().split('T')[0],
    isCompleted: 0,
    address: {
      city: "Ho Chi Minh City"
    },
    weather: {
      weather: {
        code: "fair_day",
        emoji: WeatherForecastRepository.getWeatherEmoji("fair_day")
      }
    }
  }, {
    include: [
      {
        model: Address
      },
      {
        model: WeatherForecast
      }
    ]
  });
  await Todo.create({
    task: "Christmas Holiday",
    date: new Date().toISOString().split('T')[0],
    isCompleted: 0,
    address: {
      city: "Rome"
    },
    weather: {
      weather: {
        code: "fair_day",
        emoji: WeatherForecastRepository.getWeatherEmoji("fair_day")
      }
    }
  }, {
    include: [
      {
        model: Address
      },
      {
        model: WeatherForecast
      }
    ]
  });
  await Todo.create({
    task: "Business meeting",
    date: new Date().toISOString().split('T')[0],
    isCompleted: 0,
    address: {
      city: "Singapore"
    },
    weather: {
      weather: {
        code: "fair_day",
        emoji: WeatherForecastRepository.getWeatherEmoji("fair_day")
      }
    }
  }, {
    include: [
      {
        model: Address
      },
      {
        model: WeatherForecast
      }
    ]
  });
}

module.exports = {
  initDb,
  db: {
    Todo,
    Address,
    Location,
    WeatherForecast,
    sequelize,
  }
}
