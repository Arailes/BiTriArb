const requests = require('./Requests')

const toFixed = (num, fixed) => {
  const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?')
  return num.toString().match(re)[0]
}

/**
 * Pазмещать заказы
**/
class Orders {

  exchangeInfo

  constructor() {
    ;( async () => {
      const res = await requests.get('/api/v3/exchangeInfo', { permissions: 'SPOT' })
      if (res) this.exchangeInfo = res.symbols
    })()
  }

  /**
   * Рыночная заявка
   * @param { String } params.basic
   * @param { String } params.quote
   * @param { String } params.quantity
   * @param { String } params.side
  **/
  async marketOrder(params) {
    const symbol = params.basic + params.quote
    const maxAccuracy = this.getMaxAccuracy(symbol)
    return await this.market({
      symbol: symbol,
      side: params.side,
      quantity: toFixed(params.quantity, maxAccuracy),
    })
  }

  /**
   * Рыночная заявка
   * @param { String } params.basic
   * @param { String } params.quote
   * @param { String } params.quantity
   * @param { String } params.side
  **/
  market(params) {
    const symbol = params.basic + params.quote
    const maxAccuracy = this.getMaxAccuracy(symbol)
    const orderData = {
      timestamp: new Date().getTime(),
      recvWindow: 5000,
      symbol: symbol,
      side: params.side,
      type: 'MARKET',
      quantity: toFixed(params.quantity, maxAccuracy),
    }
    return new Promise((resolve, reject) => {
      requests.postHMAC('/api/v3/order', orderData)
        .then((res) => resolve(res))
        .catch((error) => reject(error))
    })
  }


  /**
   * Рыночная заявка
   * @param { String } params.basic
   * @param { String } params.quote
   * @param { String } params.quantity
   * @param { String } params.side
  **/
  marketTest(params) {
    const symbol = params.basic + params.quote
    const maxAccuracy = this.getMaxAccuracy(symbol)
    const orderData = {
      timestamp: new Date().getTime(),
      recvWindow: 5000,
      symbol: symbol,
      side: params.side,
      type: 'MARKET',
      quantity: toFixed(params.quantity, maxAccuracy),
    }
    return new Promise((resolve, reject) => {
      requests.postHMAC('/api/v3/order/test', orderData)
        .then((res) => resolve(res))
        .catch((error) => reject(error))
    })
  }







  // async market(params) {
  //   const orderData = {
  //     timestamp: new Date().getTime(),
  //     recvWindow: 5000,
  //     symbol: params.symbol,
  //     side: params.side,
  //     type: 'MARKET',
  //     quantity: params.quantity
  //   }
  //   try {
  //     return await requests.postHMAC('/api/v3/order', orderData)
  //   } catch (error) {
  //     // logger(error)
  //     return false
  //   }
  // }


  /**
   * Получить баланс монеты
  **/
  // async getBalance(coin) {
  //   const allBalances = await this.getAllBalances()
  //   const length = allBalances.length
  //   for(let i = 0; i < length; i++) {
  //     if (allBalances[i].asset === coin) {
  //       return allBalances[i].free
  //     }
  //   }
  //   return false
  // }

  /**
   * Болучить все балансы счета
  **/
  async getAllBalances() {
    const requestData = {
      timestamp: new Date().getTime(),
      recvWindow: 5000,
    }
    try {
      const account = await requests.getHMAC('/api/v3/account', requestData)
      return account.balances
    } catch (error) {
      return false
    }
  }


  /**
   * Максимальная точность для актива
  **/
  getMaxAccuracy(symbol) {
    const info = this.exchangeInfo
    const length = info.length
    const getLotSize = (filters) => {
      for(let i of filters) {
        if (i.filterType === 'LOT_SIZE') return i
      }
    }
    const f = x => ( (x.toString().includes('.')) ? (x.toString().split('.').pop().length) : (0) )
    for(let i = 0; i < length; i++) {
      if (info[i].symbol === symbol) {
        const lotSize = getLotSize(info[i].filters)
        return f(Number(lotSize.stepSize))
      }
    }
  }



  /**
   * Получить цену в USDT
  **/
  async getPrice(symbol) {
    const data = await requests.get('/api/v3/trades', {
      symbol: symbol,
      limit: 1
    })
    return data[0].price
  }




}

module.exports = new Orders()