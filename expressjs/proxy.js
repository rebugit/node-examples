const Redis = require("ioredis");
// const redis = new Redis()

class TodoProxy{
  constructor(todoRepository) {
    this.todoRepository = todoRepository
    // this.redisClient = redis
  }


  async findAll() {
    // await this.redisClient.get("")
  }
}