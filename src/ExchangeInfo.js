const axios = require('axios')

class ExchangeInfo {

  host = process.env.HTTPS_HOST || 'https://testnet.binance.vision'

  /**
   * Получить массив всех поддерживаемых символов
   * @param { string } [ quote = '' ] - Получить все с оределённой котировкой
  **/
  async getSymbols(quote = '') {
    const unsorted = await this.#getUnsorted()
    const symbols = []
    for(let symbol of unsorted) {
      if (quote === '') {
        symbols.push(symbol.baseAsset)
      } else if (symbol.quoteAsset === quote && symbol.status === 'TRADING') {
        symbols.push(symbol.baseAsset)
      }
    }
    return [...new Set(symbols)]
  }

  /**
   * Получить тикеры 24 часовых свечей
  **/
  async getTickers24(quote) {
    const coins = await this.getSymbols(quote)
    const symbols = []
    for(let i = 0; i < coins.length; i++) {
      symbols.push(coins[i] + quote)
    }
    try {
      return symbols.length > 0
        ? await this.getRequest(`/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`) : []
    } catch (error) {
      console.log(error)
      return []
    }
  }

  /**
   * Получить разьерв лотов
  **/
  async getLotSizes() {
    try {
      const info = await this.getRequest('/api/v3/exchangeInfo?permissions=SPOT')
      const allSymbols = info.symbols
      const result = {}
      for(let data of allSymbols) {
        result[data.symbol] = this.#searchLotSize(data.filters)
      }
      return result
    } catch (error) {
      console.log(error)
      return []
    }
  }

  /**
   * Получить LOT_SIZE
  **/
  #searchLotSize(filters) {
    for(let item of filters) {
      if (item.filterType === 'LOT_SIZE') return item
    }
  }

  /**
   * Получить несортированный объект всех поддерживаеммых символов
  **/
  async #getUnsorted() {
    try {
      const spot = await this.getRequest('/api/v3/exchangeInfo?permissions=SPOT')
      return spot.symbols
    } catch(error) {
      console.log(error)
      return []
    }
  }

  /**
   * GET запрос
  **/
  getRequest(uri) {
    return new Promise((resolve, reject) => {
      axios.get(this.host + uri)
        .then((res) => {
          res.status === 200 ? resolve(res.data) : resolve(res)
        })
        .catch((error) => resolve(error))
    })
  }

}

module.exports = new ExchangeInfo()