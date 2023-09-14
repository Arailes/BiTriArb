const fastify = require('fastify')({ logger: false })
const path = require('path')

fastify.register(require('@fastify/cors'))
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname + '/../../public')
})

// Run the server!
fastify.listen({ port: 9999, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

class HttpServer {
  
  /**
   * Cлушать команду
  **/
  listenCommand(callback) {
    fastify.get('/', (req, reply) => this.static(req, reply, callback))
    fastify.get('/api', (req, reply) => this.api(req, reply, callback))
    fastify.post('/api/chain', (req, reply) => this.executeСhain(req, reply, callback))
  }

  /**
   * Исполнить цепь ордеров
  **/
  executeСhain(req, reply, callback) {
    callback({
      event: 'chain',
      data: req.body
    })
    reply.send({ statusText: 'OK' })
  }

  /**
   * Отдавать HTML
  **/
  static(req, reply, callback) {
    reply.sendFile('/index.html')
  }

  api(req, reply, callback) {
    reply.send({ hello: 'world' })
  }

}

module.exports = new HttpServer()