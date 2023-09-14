const exchangeInfo = require('../ExchangeInfo')
const WebSocket = require('ws')

module.exports = class BinanceStream {
  ws
  host = process.env.WSS_HOST || 'wss://testnet.binance.vision/ws'
  streamTimeout = process.env.STREAM_TIMEOUT || 1000 * 60 * 5
  quote
  variety

  constructor(quote, variety) {
    this.quote = quote
    this.variety = variety
  }

  /**
   * Запустить поток
  **/
  async listen(callback) {
    const symbols = await exchangeInfo.getSymbols(this.quote)
    this.ws = new WebSocket(this.host)
    this.ws.onopen = () => this.streamOpen(symbols)
    this.ws.onerror = (error) => this.streamError(error, callback)
    this.ws.onmessage = (message) => this.streamMessage(message, callback)
  }

  /**
   * Открытие потока
  **/
  async streamOpen(symbols) {
    let paramsArr = []
    for (let symbol of symbols) {
      paramsArr.push(`${(symbol + this.quote).toLowerCase()}@${this.variety}`)
      // paramsArr.push(`${(symbol + this.quote).toLowerCase()}@bookTicker`) aggTrade
    }
    this.ws.send(
      JSON.stringify({ 
        method: 'SUBSCRIBE',
        params: paramsArr,
        id: 1
      })
    )
    console.log(`Поток ${this.variety} с котировками ${this.quote} запущен.`)
  }

  /**
   * Сообщение потока
  **/
  streamMessage(message, callback) {
    this.checkStream(callback)
    const tick = JSON.parse(message.data)
    callback(tick)
    // if (typeof tick.e !== 'undefined' && tick.e === 'aggTrade') {
    // }
  }

  /**
   * Ошибка потока
  **/
  streamError(error, callback) {
    this.restartingStream(callback)
    console.log(error)
  }

  /**
   * Перезапуск потока
  **/
  restartingStream(callback) {
    this.ws.close()
    this.listen(callback)
    console.log(`Поток ${this.variety} с котировками ${this.quote} перезапущен.`)
  }

  /**
   * Закрыть поток если нет данных более 3 секунд
  */
  checkStream(callback) {
    clearTimeout(this.timeoutStream)
    this.timeoutStream = setTimeout(() => {
      if (this.ws.readyState !== 1) {
        this.restartingStream(callback)
      }
    }, this.streamTimeout)
  }


}
