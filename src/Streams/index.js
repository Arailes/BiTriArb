const Stream = require('./Stream')
const Candles = require('./Candles')

module.exports = class BinanceStream {
  
  data = {}
  symbols

  candles

  aggTradeStream
  bookTickerStream

  quote

  constructor(quote) {
    this.quote = quote
    // Candles
    this.candles = new Candles(this.quote)
    this.aggTradeStream = new Stream(this.quote, 'aggTrade')
    this.bookTickerStream = new Stream(this.quote, 'bookTicker')
  }

  /**
   * Запустить стрим
  **/
  runStream(callback) {

    this.aggTradeStream.listen((tick) => {
      if (tick.e === 'aggTrade') {
        this.candles.updateCandles(tick)
        const symbol = tick.s.split(this.quote).join('')
        const vol = this.candles.getCandlesData(symbol)
        this.data[symbol] = {
          ...this.data[symbol],
          price: Number(tick.p),
          volume: vol.volume,
          liquidity: vol.liquidity,
          volumeDifference: vol.volumeDifference
        }
        callback({
          basic: symbol,
          quote: this.quote,
          variety: 'aggTrade',
          data: this.data[symbol]
        })
      }
    })

    this.bookTickerStream.listen((tick) => {
      if (tick.e !== 'aggTrade' && typeof tick.b !== 'undefined' && typeof tick.a !== 'undefined') {
        const symbol = tick.s.split(this.quote).join('')
        this.data[symbol] = {
          ...this.data[symbol],
          bid: Number(tick.b),
          bidQty: Number(tick.B),
          ask: Number(tick.a),
          askQty: Number(tick.A)
        }
        callback({
          basic: symbol,
          quote: this.quote,
          variety: 'bookTicker',
          data: this.data[symbol]
        })
      }
    })

  }

  listen(callback) {
    this.runStream(callback)
  }

  /**
   * Получить текущие данные
  **/
  getData() {
    return this.data
  }

}