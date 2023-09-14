const fs = require('fs')

class Log {

  /**
   * Запись ошибок в файл
  */
  loggingErrors(error) {
    const dateTime = new Date().toLocaleString('ru-RU')
    if (typeof error.code !== 'undefined') {
      const response = typeof error.response !== 'undefined' ? error.response : false
      const config = typeof error.config !== 'undefined' ? error.config : false
      const responseData = response && typeof response.data !== 'undefined' 
        ? `${typeof response.data.code !== 'undefined' ? 'code: ' + response.data.code : ''}` +
          `${typeof response.data.msg !== 'undefined' ? 'msg: ' + response.data.msg : ''}`
        : ''
      const err = {
        dateTime: dateTime,
        code: typeof error.code !== 'undefined' ? error.code : '',
        method: config && typeof config.method !== 'undefined' ? config.method : '',
        url: config && typeof config.url !== 'undefined' ? config.url : '',
        data: config && typeof config.data !== 'undefined' ? config.data : '',
        response: {
          status: response && typeof response.status !== 'undefined' ? response.status : '',
          statusText: response && typeof response.statusText !== 'undefined' ? response.statusText : '',
          data: responseData
        }
      }
      const str = `${err.dateTime}, ${err.code !== '' ? 'code: ' + err.code + ', ' : ''}` +
        `${err.method !== '' ? 'method: ' + err.method + ', ' : ''}` +
        `${err.url !== '' ? 'url: ' + err.url + ', ' : ''}` +
        `${err.data !== '' ? 'data: ' + err.data + ', ' : ''}` +
        `${err.response.status !== '' ? 'responseStatus: ' + err.response.status + ', ' : ''}` +
        `${err.response.statusText !== '' ? 'responseStatusText: ' + err.response.statusText + ', ' : ''}` +
        `${err.response.data !== '' ? 'responseData: ' + err.response.data : ''}`
      const rn = process.platform === 'win32' ? '\r\n' : '\n';
      fs.appendFileSync('./log/requests-error.log', str + rn)
    } else {
      // console.log(error)
    }
  }

}

module.exports = new Log()