const constructTriangles = require('./src/Triangles')
const Stream = require('./src/Streams')
const AutomaticTrading = require('./src/AutomaticTrading')
const exchangeInfo = require('./src/ExchangeInfo')

const wsServer = require('./src/WsServer')
const httpServer = require('./src/HttpServer')
const { testMessage } = require('./src/TestMessage')

httpServer.listenCommand((comand) => {})



const automaticTrading = new AutomaticTrading()

class TriangularArbitrage {

  trading = true
  clientData = {}
  lotSizes
  homeCoin = 'USDT'
  quote = [
    'USDT', 'BTC', 'ETH', 'BNB', 'BUSD', 'DOGE', 'DOT', 'XRP', 'TRX',
  ]
  firstStep = {}
  secondStep = {}
  thirdStep = {}

  constructor() {
    this.launchTradeDataStreams()
    setInterval(async () => wsServer.send(this.clientData), 1000)
  }

  /**
   * Запустить потоки торговых данных
  **/
  async launchTradeDataStreams() {
    this.lotSizes = await exchangeInfo.getLotSizes()
    for(let coin of this.quote) {
      const stream = new Stream(coin)
      stream.listen((tick) => {
        this.updateFirstStep(tick)
        this.updateSecondStep(tick)
        this.updateThirdStep(tick)
        if (this.firstStep[tick.basic] && this.trading) {
          this.triangleTrading(tick)
        }
      })
    }
  }

  /**
   * торговля треугольников
  */
  triangleTrading(tick) {
    if (tick.variety === 'bookTicker') {
      const coinTriangles = constructTriangles.getList({
        firstStep: this.firstStep[tick.basic],
        secondStep: this.secondStep[tick.basic],
        thirdStep: this.thirdStep,
        lotSizes: this.lotSizes
      })
      // automaticTrading.tick(coinTriangles)
      // testMessage(coinTriangles)
      this.updateDataToSentToClient(coinTriangles)
    }
  }

  /**
   * Обновить данные для отправки на клиент
  **/
  updateDataToSentToClient(coinTriangles) {
    for(let item of coinTriangles) {
      const name = item.firstStepBasic + item.firstStepQuote +
        item.secondStepBasic + item.secondStepQuote +
        item.thirdStepBasic + item.thirdStepQuote
      this.clientData[name] = item
    }
  }

  /**
   * Обновить первый шаг
  **/
  updateFirstStep(tick) {
    if (tick.quote === this.homeCoin) {
      this.firstStep[tick.basic] = {
        basic: tick.basic,
        quote: tick.quote,
        ...tick.data
      }
    }
  }

  /**
   * Обновить второй шаг
  **/
  updateSecondStep(tick) {
    if (tick.quote !== this.homeCoin) {
      this.secondStep[tick.basic] = {
        ...this.secondStep[tick.basic],
        [tick.quote]: {
          basic: tick.basic,
          quote: tick.quote,
          ...tick.data
        }
      }
    }
  }

  /**
   * Обновить третий шаг
  **/
  updateThirdStep(tick) {
    if (tick.quote === this.homeCoin && this.quote.includes(tick.basic)) {
      this.thirdStep[tick.basic] = {
        basic: tick.basic,
        quote: tick.quote,
        ...tick.data
      }
    }
  }

}

new TriangularArbitrage()
