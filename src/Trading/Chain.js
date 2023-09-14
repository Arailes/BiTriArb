const userStream = require('./UserStream')
const orders = require('./Orders')

/**
 * Последовательная цепть ордеров
**/
class Сhain {

  steps
  tradingAmount = process.env.TRADING_AMOUNT || 14
  response = {}
  startTime

  constructor() {
    userStream.run((data) => {
      const stepNum = this.defineStep(data.s)
      if(data.X === 'NEW' && data.x === 'NEW') {
        this.placedOrder(data, stepNum)
      } else if (data.x === 'TRADE' && data.X === 'FILLED' && data.r === 'NONE') {
        this.orderFilled(data, stepNum)
      } else {
        console.log(data)
      }
    })
  }

  /**
   * Выполнить цепоку заказов
  **/
  execute(steps, callback) {
    callback({ status: 'start' })
    this.startTime = new Date().getTime()
    this.callback = callback
    this.steps = this.getSteps(steps)
    this.marketOrder(0, this.tradingAmount / Number(this.steps[0].price))
      .catch((error) => this.stepError(0))
  }

  /**
   * Pазместил ордер
  **/
  placedOrder(data, stepNum) {
    this.response[stepNum] = {
      ...this.response[stepNum],
      symbol: data.s,
      placedPrice: this.steps[stepNum].price,
      ask: this.steps[stepNum].ask,
      bid: this.steps[stepNum].bid,
      askQty: this.steps[stepNum].askQty,
      bidQty: this.steps[stepNum].bidQty,
      spread: this.steps[stepNum].spread
    }
  }

  /**
   * Ордер исполнен
  **/
  orderFilled(data, stepNum) {
    if (stepNum === 0 || stepNum === 1) {
      this.notFirstSteps(stepNum, stepNum === 0 ? Number(data.q) : Number(data.Z))
    }
    this.response[stepNum] = {
      ...this.response[stepNum],
      status: 'success',
      filledPrice: data.L,
      volume: data.Z,
      time: new Date().getTime() - this.startTime
    }
    if (stepNum === 2) {
      const profit = Number(data.Z) - Number(this.response[0].volume)
      this.callback({ status: 'end', data: this.response, profit: profit })
    }
  }

  /**
   * Не первые шаги
  */
  notFirstSteps(num, quantity) {
    const q = quantity - (quantity / 100 * 0.1)
    this.marketOrder(num + 1, q)
      .catch((err) => this.stepError(num + 1))
  }

  /**
   * Ошибка шага
  **/
  stepError(num) {
    this.response[num] = {
      status: 'error',
      symbol: this.steps[num].basic + this.steps[num].quote,
      data: this.response
    }
    this.callback({ status: 'error', data: this.response })
  }

  /**
   * Определить шаг и получить данные
  **/
  defineStep(symbol) {
    for(let i in this.steps) {
      if (symbol === this.steps[i].basic + this.steps[i].quote) {
        return Number(i)
      }
    }
    return false
  }

  /**
   * Получить объект шагов
  **/
  getSteps(steps) {
    return {
      0: {
        basic: steps.firstStepBasic,
        quote: steps.firstStepQuote,
        price: steps.firstStepPrice,
        ask: steps.firstStepAsk,
        bid: steps.firstStepBid,
        askQty: steps.firstStepAskQty,
        bidQty: steps.firstStepBidQty,
        spread: steps.firstStepSpread,
      },
      1: {
        basic: steps.secondStepBasic,
        quote: steps.secondStepQuote,
        price: steps.secondStepPrice,
        ask: steps.secondStepAsk,
        bid: steps.secondStepBid,
        askQty: steps.secondStepAskQty,
        bidQty: steps.secondStepBidQty,
        spread: steps.secondStepSpread,
      },
      2: {
        basic: steps.thirdStepBasic,
        quote: steps.thirdStepQuote,
        price: steps.thirdStepPrice,
        ask: steps.thirdStepAsk,
        bid: steps.thirdStepBid,
        askQty: steps.thirdStepAskQty,
        bidQty: steps.thirdStepBidQty,
        spread: steps.thirdStepSpread,
      }
    }
  }

  /**
   * Рыночный ордер
  **/
  marketOrder(item, quantity) {
    const data = {
      basic: this.steps[item].basic,
      quote: this.steps[item].quote,
      side: item === 0 ? 'BUY' : 'SELL',
      quantity: quantity,
    }
    return new Promise((resolve, reject) => {
      orders.market(data).then(() => resolve())
        .catch((error) => reject())
    })
    
  }

}

module.exports = new Сhain()