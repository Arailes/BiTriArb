const WebSocket = require('ws')
const requests = require('./Requests')
const LISTEN_KEY_ENDPOINT = `/api/v3/userDataStream`

/**
 * Поток пользовательских данных
**/
class UserStream {
  host = process.env.WSS_HOST || 'wss://testnet.binance.vision/ws'
  ws

  async run(callbak) {
    const listenKey = await this.#getListenKey()
    this.ws = new WebSocket(`${this.host}/${listenKey}`)
    this.ws.onopen = () => console.log('Поток пользовательских данных открыт!')
    this.ws.onerror = () => this.onError(callbak)
    this.ws.onclose = () => this.onClose(callbak)
    this.ws.onmessage = (message) => this.onMessage(message, callbak)
    this.checkStream(callbak)
  }

  /**
   * Обработка входящего сообщения
  **/
  onMessage(message, callbak) {
    this.checkStream(callbak)
    const tick = JSON.parse(message.data)
    callbak(tick)
  }

  /**
   * Поток закрылся
  **/
  onClose(callbak) {
    console.log('CLOSE')
    // callbak({ status: 'close', message: 'Поток пользовательских данных завершен!'})
    this.ws.close()
  }

  /**
   * Ошибка потока
  **/
  onError(callbak) {
    console.log('ERROR')
    // callbak({ status: 'error', message: 'Ошибка подключения к потоку Binance!' })
    this.ws.close()
  }

  /**
   * Перезапустить поток если нет данных более 5 минут
  */
  checkStream(callback) {
    clearTimeout(this.timeoutStream)
    this.timeoutStream = setTimeout( async () => {
      this.ws.close()
      await this.run(callback)
    }, 60 * 1000 * 10)
  }

  /**
   * Получить listenKey
  **/
  async #getListenKey() {
    const sleep = async () => new Promise(r => setTimeout(r, 2000))

    const connected = async () => {
      let data = await requests.post(LISTEN_KEY_ENDPOINT)
      await sleep()
      return data ? data.listenKey : false
    }
    let listenKey = false
    while(!listenKey) listenKey = await connected()

    return new Promise(r => r(listenKey))
    // return listenKey
  }
}

module.exports = new UserStream()