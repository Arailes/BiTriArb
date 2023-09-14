const telegram = require('./Telegram')

class TestMessage {
  blackList = []

  send(data) {
    const symbol = data.firstStepBasic + data.firstStepQuote
    if (!this.blackList.includes(symbol)) {
      this.freezeCoin(symbol)
      this.sendMessage(data, symbol)
    }
  }

  sendMessage(data, symbol) {
    const time = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit', minute: '2-digit', fractionalSecondDigits: 3
    })
    let message = "Time: " + time + "\n"
    message += '============' + "\n"
    message += "`" + symbol + "`\n"
    message += '  P: `' + data.firstStepPrice + "` | "
    message += '  Liq: ' + data.firstStepLiquidity + " | "
    message += '  ' + data.firstStepVolUSTD + "$ | "
    message += '  X ' + data.firstStepVolDifference + "\n"
    message += '  Bid: ' + data.firstStepBid + ', Ask: ' + data.firstStepAsk + "\n"
    message += '============' + "\n"
    message += "`" + data.secondStepBasic + data.secondStepQuote + "`\n"
    message += '  P: `' + data.secondStepPrice + "` | "
    message += '  Liq: ' + data.secondStepLiquidity + " | "
    message += '  ' + data.secondStepVolUSTD + "$ | "
    message += '  X ' + data.secondStepVolDifference + "\n"
    message += '  Bid: ' + data.secondStepBid + ', Ask: ' + data.secondStepAsk + "\n"
    message += '============' + "\n"
    message += "`" + data.thirdStepBasic + data.thirdStepQuote + "`\n"
    message += '  Price: `' + data.thirdStepPrice + "`\n"
    message += '  Bid: ' + data.thirdStepBid + ', Ask: ' + data.thirdStepAsk + "\n"
    message += '============' + "\n"
    message += 'Potential: *' + data.potential + "*"
    telegram.sendMessage(message)
  }

  /**
   * Заморозить монету на определенное время
  **/
  freezeCoin(symbol) {
    this.blackList.push(symbol)
    setTimeout(() => {
      const index = this.blackList.indexOf(symbol)
      this.blackList.splice(index, 1)
    }, 1000 * 60 * 5)
  }

}

// const testMessage_0 = new TestMessage()
const testMessage_02 = new TestMessage()
const testMessage_05 = new TestMessage()
const testMessage_1 = new TestMessage()

/**
 * Тестовое сообщение
**/
const testMessage = (allTriangles) => {
  const length = allTriangles.length
  for(let i = 0; i < length; i++) {
    // if (allTriangles[i].potential > 0) {
    //   testMessage_0.send(allTriangles[i])
    // }
    if ( allTriangles[i].potential >= 0.2 && allTriangles[i].potential < 0.5 ) {
      testMessage_02.send(allTriangles[i])
    }
    if ( allTriangles[i].potential >= 0.5 && allTriangles[i].potential < 1 ) {
      testMessage_05.send(allTriangles[i])
    }
    if ( allTriangles[i].potential >= 1 ) {
      testMessage_1.send(allTriangles[i])
    }
  }
}

module.exports = { testMessage }