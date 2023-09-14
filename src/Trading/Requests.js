const crypto = require('crypto')
const axios = require('axios')
const log = require('../Log')

/**
 * Запросы к серверу API Binance
**/
class Requests {

  key
  secret
  host
  options

  constructor() {
    this.key = process.env.BINANCE_KEY || 'jWrHNpYnKfrx8riPSGg7F6MBDXrGBVHKswXO0f3ZS53oqu9LOcPsMqVZnhc66D45'
    this.secret = process.env.BINANCE_SECRET || 'CApxf5yinHTxFNOLQyaeHz6gMIQEy8j8V5nDtNNShKYdJbBRL6JDxgUQIcADcmjX'
    this.host = process.env.HTTPS_HOST || 'https://testnet.binance.vision'
    this.options = {
      headers: {
        'X-MBX-APIKEY': this.key,
        'X-MBX-APISECRET': this.secret,
      }
    }
  }

  /**
   * GET с подписью
  **/
  async getHMAC(uri, data) {
    const signature =  this.getSignature(data)
    return await this.get(uri, data, signature)
  }

  /**
   * GET с подписью
  **/
  get(uri, data, signature = '') {
    const sig = signature !== '' ? '&signature=' + signature : ''
    const url = uri + '?' + this.serialize(data) + sig
    return new Promise((resolve, reject) => {
      axios.get(this.host + url, this.options).then((res) => {
        res.status === 200 ? resolve(res.data) : reject(false)
      }).catch((error) => {
        log.loggingErrors(error)
        reject(error)
      })
    })
  }


  /**
   * POST с подписью
  **/
  async postHMAC(uri, data) {
    const body = this.serialize(data)
    return await this.post(`${uri}?signature=${this.getSignature(data)}`, body)
  }

  /**
   * POST запрос
  **/
  post(uri, data) {
    return new Promise((resolve, reject) => {
      axios.post(this.host + uri, data, this.options)
        .then((res) => {
          res.status === 200 ? resolve(res.data) : reject(false)
        }).catch((error) => {
          log.loggingErrors(error)
          reject(error)
        })
    })
  }

  /**
   * DELETE с подписью
  **/
  deleteHMAC(uri, data) {
    const url = this.host + uri + '?signature=' + this.getSignature(data)
    const body = this.serialize(data)
    return new Promise((resolve, reject) => {
      axios.delete(url, { data: body, headers: this.options['headers'] }).then((res) => {
        res.status === 200 ? resolve(res.data) : reject(false)
      }).catch((error) => {
        log.loggingErrors(error)
        reject(error)
      })
    })
  }

  /**
   * Сеарилизация объекта
  **/
  serialize(obj) {
    let arr = []
    for (let i in obj) arr.push(`${i}=${obj[i]}`)
    return arr.join('&')
  }

  /**
   * Получить подпись
  **/
  getSignature(data) {
    return crypto.createHmac('sha256', this.secret)
      .update(this.serialize(data)).digest('hex')
  }

}

module.exports = new Requests()