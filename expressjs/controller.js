class Controller {
  constructor(todoRepository, positionRepository, weatherRepository, awsServiceRepository) {
    this.todoRepository = todoRepository
    this.positionRepository = positionRepository
    this.weatherRepository = weatherRepository
    this.awsServiceRepository = awsServiceRepository
  }

  home = async (req, res) => {
    res.status(200).send({
      message: "OK"
    })
  }

  getAllTodos = async (req, res, next) => {
    try {
      const response = await this.todoRepository.findAll();

      const dtos = response.map(todo => ({
        id: todo.id,
        task: todo.task,
        date: todo.date,
        city: todo.address.city,
        isCompleted: todo.isCompleted,
        weather: todo.weather.weather
      }))

      res.status(200).send({
        message: "Success",
        data: dtos
      })
    } catch (e) {
      next(e)
    }
  }

  createTodo = async (req, res, next) => {
    try {
      const {task, date, city} = req.body

      const result = await this.todoRepository.startT(async (t) => {
        const apiKey = await this.awsServiceRepository.getSecretManagerApiKey();
        console.log("Got API Key for mapQuest")
        const location = await this.positionRepository.getLocationByCity(city, apiKey);
        console.log(`Got position for ${city}`)
        const createdTodo = await this.todoRepository.createWithT({task, date}, t);
        console.log("Todo created")
        const createdAddress = await this.positionRepository.createAddressWithT({city}, createdTodo.id, t);
        console.log("Address created")
        const createdLocation = await this.positionRepository.createLocationWithT(location, createdTodo.id, createdAddress.id, t);
        console.log("Location created")
        const weather = await this.weatherRepository.getAtLocationAndDate(createdLocation, createdTodo.date);
        console.log(`Weather found: ${weather.weather.emoji}`)
        await this.weatherRepository.createWithT(weather, createdTodo.id, createdLocation.id, t)

        return {
          id: createdTodo.id,
          task: createdTodo.task,
          date: createdTodo.date,
          city: createdAddress.city,
          isCompleted: createdTodo.isCompleted,
          weather: weather.weather
        }
      })

      res.status(200).send({
        message: "Success",
        data: result
      })
    } catch (e) {
      next(e)
    }
  }

  rescheduleTodo = async (req, res, next) => {
    const {todoId, city, date} = req.body

  }

  checkWeatherForTodo = async (req, res, next) => {
    try {
      const {todoId} = req.params
      const location = await this.positionRepository.getLocationByTodoId(todoId);
      const weather = await this.weatherRepository.getAtLocationAndDate(location, createdTodo.date);
      await this.weatherRepository.createWithT(weather, "")
    } catch (e) {
      next(e)
    }
  }

  deleteTodoById = async (req, res, next) => {
    try {
      const {todoId} = req.params
      await this.todoRepository.deleteById(todoId)
      res.status(200).send({
        message: "Success",
        data: todoId
      })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = {
  Controller
}