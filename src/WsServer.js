const { WebSocketServer } = require('ws')
const { v4: uuidv4 } = require('uuid')

class WsServer {
  server = {}
  activeConnections = {}
  constructor() {
    this.server = new WebSocketServer({ port: 5999 })
    this.connections()
  }

  /**
   * Соединения
  **/
  connections() {
    this.server.on('connection', (socket) => {
      const connectID = uuidv4()
      this.activeConnections[connectID] = socket
      socket.on('close', () => {
        delete this.activeConnections[connectID]
      })
    })
  }

  /**
   * Отправить данные на клиент
  **/
  send(data) {
    const keys = Object.keys(this.activeConnections)
    const connectsNum = keys.length
    if (connectsNum !== 0) {
      for(let i = 0; i < connectsNum; i++) {
        this.activeConnections[keys[i]].send(JSON.stringify(data))
      }
    }
  }
}

module.exports = new WsServer()