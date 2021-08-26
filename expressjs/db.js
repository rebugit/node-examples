const { Sequelize, DataTypes } = require("sequelize");
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
  instant: DataTypes.JSONB,
  next_1_hours: DataTypes.JSONB,
  next_6_hours: DataTypes.JSONB,
  next_12_hours: DataTypes.JSONB,
});

Todo.hasOne(Address, { foreignKey: 'todo_id', onDelete: 'cascade' });
Address.hasOne(Location, { foreignKey: 'address_id', onDelete: 'cascade' });
Location.hasOne(WeatherForecast, { foreignKey: 'location_id', onDelete: 'cascade' });

async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await Todo.create({
    task: "Go fishing",
    date: new Date().toISOString(),
    isCompleted: 0,
    address: {
      city: "Ho Chi Minh City"
    }
  }, {
    include: Address
  });
  await Todo.create({
    task: "Christmas Holiday",
    date: new Date().toISOString(),
    isCompleted: 0,
    address: {
      city: "Rome"
    }
  }, {
    include: Address
  })
  await Todo.create({
    task: "Business meeting",
    date: new Date().toISOString(),
    isCompleted: 0,
    address: {
      city: "Singapore"
    }
  }, {
    include: Address
  })
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
