const telegramBot = require('./Telegram')
const trading = require('./Trading')

module.exports = class AutomaticTrading {

  locked = false
  blackList = []
  message = ''

  /**
   * Тик обновление данных
  **/
  tick(data) {
    const length = data.length
    for(let i = 0; i < length; i++) {
      const res = this.checkConditions(data[i])
      if (res) {
        this.executeBundle(data[i], {}) 
        break
      }
    }
  }

  /**
   * Проверить условия
  **/
  checkConditions(data) {
    const potential = process.env.POTENTIAL || 0.3 // Mim
    const firstStepVolUSTD = process.env.FIRST_STEP_VOL_USTD || 0 // Mim
    const secondStepVolUSTD = process.env.SECOND_STEP_VOL_USTD || 0 // Mim
    const firstStepLiquidity = process.env.FIRST_STEP_LIQUIDITY || 0 // Mim
    const secondStepLiquidity = process.env.SECOND_STEP_LIQUIDITY || 0 // Mim
    const firstStepVolDifference = process.env.FIRST_STEP_VOL_DIFFERENCE || 0 // Max
    const secondStepVolDifference = process.env.SECOND_STEP_VOL_DIFFERENCE || 0 // Max
    return data.potential >= potential
      && data.firstStepVolUSTD >= firstStepVolUSTD
      && data.secondStepVolUSTD >= secondStepVolUSTD
      && data.firstStepLiquidity >= firstStepLiquidity
      && data.secondStepLiquidity >= secondStepLiquidity
      && data.firstStepVolDifference <= firstStepVolDifference
      && data.secondStepVolDifference <= secondStepVolDifference
      && !this.blackList.includes(data.firstStepBasic + data.firstStepQuote)
      && !this.locked
  }

  /**
   * Выполнить треугольник
  **/
  executeBundle(data) {
    this.locked = true
    trading.executeСhain(data, (res) => {
      const symbol = data.firstStepBasic + data.firstStepQuote
      if(res.status === 'end') {
        telegramBot.events(res.data)
        if (res.profit < 0) this.freezeCoin(symbol)
        this.locked = false
      }
      if(res.status === 'error') {
        telegramBot.events(res.data)
        this.freezeCoin(symbol)
        this.locked = false
      }
    })
  }

  /**
   * Заморозить монету на определенное время
  **/
  freezeCoin(symbol) {
    this.blackList.push(symbol)
    setTimeout(() => {
      const index = this.blackList.indexOf(symbol)
      this.blackList.splice(index, 1)
    }, 1000 * 60 * 5)
  }

}