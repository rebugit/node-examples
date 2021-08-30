class SagaCoordinator {

  async createCompensatingAction(id, cb) {
    return async function () {
      return cb(id)
    }
  }

  async saga(sagaId, operations){
    const compensations = []
    while (operations.length){
      try {
        const {transaction, compensation} = operations.shift();
        const result = await transaction();
        compensations.push(this.createCompensatingAction(result.id, compensation))
      } catch (e) {
        await Promise.all(compensations)
      }
    }
  }
}