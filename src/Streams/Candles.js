const exchangeInfo = require('../ExchangeInfo')

/**
 * Свечи
**/
module.exports = class Candles {
  candles = {}
  tickers24h = {}

  quantityCandles
  time

  quote

  constructor(quote) {
    this.quote = quote
    this.quantityCandles = 100
    this.time = 5000
    this.updateTickers24h()
  }

  /**
   * Обновлять 24 часовые тикеры
  **/
  async updateTickers24h() {
    const update = async () => {
      const tickers = await exchangeInfo.getTickers24(this.quote)
      if (tickers) this.fotmatedTicker24h(tickers)
    }
    await update()
    setInterval( async () => await update(), 1000 * 60)
  }

  /**
   * Получить 24 часовой тикер
  **/
  fotmatedTicker24h(tickers) {
    for(let i = 0; i < tickers.length; i++) {
      const coin = tickers[i].symbol.split(this.quote).join('')
      this.tickers24h[coin] = tickers[i]
    }
  }

  /****************************************************************************
   *                                GET DATA
  ****************************************************************************/

  /**
   * Получить торговые данные
  */
  getCandlesData(coin) {
    const volMinute = this.getVolumeOneMinute(coin)
    return {
      volume: volMinute,
      liquidity: this.getLiquidity(coin),
      volumeDifference: this.getVolumeDifference(coin, volMinute)
    }
  }

  /**
   * Получить разницу объёмов
  **/
  getVolumeDifference(coin, volMinute) {
    const ticker24h = this.tickers24h[coin]
    const vol24h = ticker24h.volume / 24 / 60
    const difference = Number((volMinute / vol24h).toFixed(0))
    return difference > 0 ? difference : 0
  }

  /**
   * Получить объём за последнюю минуту
  **/
  getVolumeOneMinute(symbol) {
    let volume = 0
    const length = this.candles[symbol].length - 1
    for(let i in this.candles[symbol]) {
      volume += this.candles[symbol][length - Number(i)].volume
      if(Number(i) === 11) break
    }
    return volume
  }

  /**
   * Получить леквидность (Процент заполненых свечек)
  **/
  getLiquidity(symbol) {
    let filledСandles = 0
    const length = Number(this.candles[symbol].length)
    for(let i = 0; i < length; i++) {
      if (this.candles[symbol][i].volume !== 0) filledСandles++
    }
    const result = (length > 5 ? filledСandles * 100 / length : 0).toFixed(0)
    return Number(result)
  }

  /****************************************************************************
   *                              UPDATE DATA
  ****************************************************************************/

  /**
   * Обновить значения
  **/
  updateCandles(tick) {
    const coin = tick.s.split(this.quote).join('')
    if (!this.candles[coin]) this.firstTick(coin)
    this.tickets({
      coin: coin,
      currentPrice: Number(tick.p),
      quantity: Number(tick.q),
      market: tick.m
    })
    return this.candles[coin]
  }

  /**
   * После каждого тикета обновляем свечу
   * @param { String } params.coin
   * @param { Number } params.currentPrice
   * @param { Number } params.quantity
   * @param { Boolean } params.market
  **/
  tickets(params) {
    const last = this.candles[params.coin].length - 1
    params.market
      ? this.candles[params.coin][last].sell += params.quantity // Тикет продажи
      : this.candles[params.coin][last].buy += params.quantity // Тикет покупки
    this.candles[params.coin][last].volume += params.quantity
    this.candles[params.coin][last].currentPrice = params.currentPrice
  }

  /**
   * Первый тик
  **/
  firstTick(coin) {
    this.candles[coin] = []
    this.addCandle(coin)
    setInterval(() => {
      this.addCandle(coin)
      this.removeFirstCandle(coin)
    }, this.time)
  }

  /**
   * Добавить свечу
  **/
  addCandle(coin) {
    const currentPrice = this.getCurrentPrice(coin)
    this.candles[coin].push({
      buy: 0,
      sell: 0,
      volume: 0,
      currentPrice,
    })
  }

  /**
   * Получить текущую цену
  **/
  getCurrentPrice(coin) {
    const last = this.candles[coin].length - 1
    return last > 0 ? this.candles[coin][last].currentPrice : 0
  }

  /**
   * Убрать первую свечу
  **/
  removeFirstCandle(coin) {
    if(this.candles[coin].length > this.quantityCandles)
      this.candles[coin].shift()
  }

}
