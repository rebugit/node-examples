const {Sequelize, DataTypes} = require("sequelize");
const {WeatherForecastRepository} = require("./repository");
const bcrypt = require("bcrypt");
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  MYSQL_DB_USER,
  MYSQL_DB_PASSWORD,
  MYSQL_DB_HOST,
  MYSQL_DB_PORT,
  MYSQL_DB_NAME
} = process.env
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
const sequelizeMysql = new Sequelize(`mysql://${MYSQL_DB_USER}:${MYSQL_DB_PASSWORD}@${MYSQL_DB_HOST}:${MYSQL_DB_PORT}/${MYSQL_DB_NAME}`);

const User = sequelizeMysql.define(
  "user",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    email: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING(64),
      is: /^[0-9a-f]{64}$/i
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  }
);


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
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
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

User.beforeCreate(user => (user.password = bcrypt.hashSync(user.password, 10)))

function getDate(n) {
  const today = new Date();
  return new Date(today.getTime() + (n * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
}

async function initDb() {
  await sequelize.authenticate();
  await sequelizeMysql.authenticate();
  await sequelize.sync({force: true});
  await sequelizeMysql.sync({force: true})

  const createdUser = await User.create({
    email: "email@example.com",
    password: "12345678abcd",
    id: "c5178df1-53cb-4ffc-9343-a3cfac281c51"
  });

  await Todo.create({
    task: "Go fishing",
    date: getDate(1),
    isCompleted: 0,
    address: {
      city: "Ho Chi Minh City"
    },
    weather: {
      weather: {
        code: "fair_day",
        emoji: WeatherForecastRepository.getWeatherEmoji("fair_day")
      }
    },
    userId: createdUser.id
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
    date: getDate(0),
    isCompleted: 0,
    address: {
      city: "Rome"
    },
    weather: {
      weather: {
        code: "fair_day",
        emoji: WeatherForecastRepository.getWeatherEmoji("fair_day")
      }
    },
    userId: createdUser.id
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
    date: getDate(3),
    isCompleted: 0,
    address: {
      city: "Singapore"
    },
    weather: {
      weather: {
        code: "fair_day",
        emoji: WeatherForecastRepository.getWeatherEmoji("fair_day")
      }
    },
    userId: createdUser.id
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
    User,
    WeatherForecast,
    sequelize,
    sequelizeMysql
  }
}
