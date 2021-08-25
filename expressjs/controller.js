class Controller {
  constructor(todoRepository) {
    this.todoRepository = todoRepository
  }
  home = async (req, res) => {
    res.status(200).send({
      message: "OK"
    })
  }

  getAllTodos = async (req, res, next) => {
    const response = await this.todoRepository.findAll();

    res.status(200).send({
      message: "Success",
      data: response
    })

  }
}

module.exports = {
  Controller
}