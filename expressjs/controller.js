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
        isCompleted: todo.isCompleted
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
        const location = await this.positionRepository.getLocationByCity(city, apiKey);
        const createdTodo = await this.todoRepository.createWithT({task, date}, t);
        const createdAddress = await this.positionRepository.createAddressWithT({city}, createdTodo.id, t);
        await this.positionRepository.createLocationWithT(location, createdAddress.id, t);

        return {
          id: createdTodo.id,
          task: createdTodo.task,
          date: createdTodo.date,
          city: createdAddress.city,
          isCompleted: createdTodo.isCompleted
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

  updateTodoAddress = async (req, res, next) => {
    const {todoId, city} = req.body

  }

  getWeatherForTodo = async (req, res, next) => {

  }
}

module.exports = {
  Controller
}