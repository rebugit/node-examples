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
      const response = await this.todoRepository.findAll(req.userId);

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
      const {task, date, city} = req.body;
      const userId = req.userId;
      const apiKey = await this.awsServiceRepository.getSecretManagerApiKey();
      console.log("Got API Key for mapQuest")
      const location = await this.positionRepository.getLocationByCity(city, apiKey);
      console.log(`Got position for ${city}`)

      const result = await this.todoRepository.startT(async (t) => {
        const createdTodo = await this.todoRepository.createWithT({task, date, userId}, t);
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
    try {
      const {todoId} = req.params
      const userId = req.userId;
      const {city, date} = req.body;

      const apiKey = await this.awsServiceRepository.getSecretManagerApiKey();
      console.log("Got API Key for mapQuest")
      const location = await this.positionRepository.getLocationByCity(city, apiKey);
      console.log(`Got location for ${city}`)
      const weather = await this.weatherRepository.getAtLocationAndDate(location, date);
      console.log(`Weather found: ${weather.weather.emoji}`)
      const result = await this.todoRepository.startT(async (t) => {
        const updatedTodo = await this.todoRepository.updateByIdWithT(todoId, {city, date, userId}, t);
        await this.positionRepository.updateAddressByTodoIdWithT(todoId, {city}, t)
        await this.weatherRepository.updateByTodoIdWithT(todoId, weather, t)
        return {
          id: todoId,
          task: updatedTodo.task,
          date: date,
          city: city,
          isCompleted: updatedTodo.isCompleted,
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

  deleteTodoById = async (req, res, next) => {
    try {
      const {todoId} = req.params
      const userId = req.userId;

      await this.todoRepository.deleteById(todoId, userId)
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