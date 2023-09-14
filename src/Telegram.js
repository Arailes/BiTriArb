const axios = require('axios')

class TelegramBot {
  token = ''
  chats = []

  message = ''

  /**
   * События торговли
  **/
  events(steps) {
    let error = false
    for(let i in steps) {
      const stepIcon = ["1️⃣", "2️⃣", "3️⃣"]
      if (steps[i].status === 'success') {
        this.message += stepIcon[i] + " `" + steps[i].symbol + "` " + (i === '0' ? 'BUY' : 'SELL') + "\n"
        this.message += "        Рассчитан: `" + Number(steps[i].placedPrice) + "`\n"
        this.message += "        Заполнен: `" + Number(steps[i].filledPrice) + "`" + "\n"
        this.message += "        Объем котировки: `" + Number(steps[i].volume) + "`" + "\n"
        this.message += "        Мс от старта: *" + steps[i].time + "*\n"
        this.message += "        Ask: `" + steps[i].ask + "`, Bid: `" + steps[i].bid + "`\n"
        this.message += "        AskQty: " + steps[i].askQty + ", BidQty: " + steps[i].bidQty + "\n"
        this.message += "        Spread: " + steps[i].spread + "\n\n"
      } else {
        this.message += "❗️ Ошибка `" + steps[i].symbol + "` ❗️\n\n"
        error = true
        break
      }
    }

    if (!error) {
      const profit = this.calcPercenProfit(steps)
      this.message += "💰*Профит:* `" + profit + "`"
      this.message += `${profit < 0 ? ' %❌❌❌' : ' %✅✅✅'}`
    }

    this.sendMessage(this.message)
    this.message = ''
  }

  /**
   * Посчитать процент профита
  **/
  calcPercenProfit(steps) {
    const filled1 = Number(steps[0].filledPrice)
    const filled2 = Number(steps[1].filledPrice)
    const filled3 = Number(steps[2].filledPrice)
    const orderVol = Number(steps[0].volume)
    const triangleResult = this.subtractCommission(
      (filled2 * (orderVol / filled1)) * filled3
    )
    const profit = (triangleResult * 100 / orderVol - 100).toFixed(2)
    return Number(profit)
  }

  /**
   * Вычесть комиссию
  */
  subtractCommission(summ) {
    return summ - (0.3 * summ / 100)
  }


  /**
   * Отправка сооббщения открытия позиции
  **/
  sendMessage(message) {
    for(let chat of this.chats) this.send(chat, message)
  }

  /**
   * Отправка сообщения
  **/
  send(chat_id, message) {
    const url = `https://api.telegram.org/bot${this.token}/sendMessage?` +
      `parse_mode=markdown&disable_web_page_preview=true&chat_id=${chat_id}&text=${encodeURIComponent(message)}`
    axios.get(url)
  }

}

module.exports = new TelegramBot()

