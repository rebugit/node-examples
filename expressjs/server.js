const {initDb, db} = require('./db')
// This package must be imported even if there are no methods to require
const {RebugitSDK} = require('rbi-nodejs-agent');
const cors = require('cors')
const bodyParser = require('body-parser')
const express = require('express')
const {Controller} = require("./controller");
const {TodoRepository, PositionRepository, AWSServicesRepository, WeatherForecastRepository} = require("./repository");
const {login, isLoggedIn} = require("./auth");
const app = express()
const port = process.env.PORT

const Rebugit = new RebugitSDK({
  apiKey: process.env.REBUGIT_API_KEY,
  collector: {
    collectorBaseUrl: process.env.REBUGIT_API_ENDPOINT
  }
})

process.on('SIGINT', () => {
  console.info("Interrupted")
  process.exit(0)
})

const todoRepository = new TodoRepository(db)
const positionRepository = new PositionRepository(db)
const weatherRepository = new WeatherForecastRepository(db)
const awsServices = new AWSServicesRepository()
const controller = new Controller(todoRepository, positionRepository, weatherRepository, awsServices)

initDb()
  .then()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })

app.use(cors())
app.use(bodyParser.json())
app.use(Rebugit.Handlers().requestHandler({}))
app.get('/', controller.home)
app.post('/login', login)
app.get('/todos', isLoggedIn, controller.getAllTodos)
app.post('/todos', isLoggedIn, controller.createTodo)
app.put('/todos/:todoId/reschedule', isLoggedIn, controller.rescheduleTodo)
app.delete('/todos/:todoId', isLoggedIn, controller.deleteTodoById)

app.use(Rebugit.Handlers().errorHandler({}))

app.use(function onError(err, req, res, next) {
  console.log(err.message, err.stack)
  res.statusCode = 500;
  res.send(err.message)
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
