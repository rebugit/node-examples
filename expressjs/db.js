const { Sequelize, Model, DataTypes } = require("sequelize");
const {DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME} = process.env
const sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

const Todo = sequelize.define("todo", {
  task: DataTypes.TEXT,
  date: DataTypes.TEXT,
  isCompleted: DataTypes.INTEGER
});

const WeatherForecast = sequelize.define("weather", {

});

const Location = sequelize.define("location", {

});

Todo.hasOne(WeatherForecast);
Todo.hasOne(Location);


(async () => {
  await sequelize.sync({ force: true });
  // Seed here

})();

module.exports = Todo
