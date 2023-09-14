const chain = require('./Chain')

class Trading {

  /**
   * Исполнить цепь ордеров
  **/
  executeСhain(steps, callback) {
    chain.execute(steps, callback)
  }

  /**
   * Отменить все выставленные ордера
  **/
  cancelAll() {
    console.log('Cancel all')
  }

}

module.exports = new Trading()