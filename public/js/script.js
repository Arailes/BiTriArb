
class Stream {
  ws

  /**
   * Запустить поток
  **/
  async listen(callback) {
    this.ws = new WebSocket('ws://192.168.1.111:5000')
    this.ws.onerror = (error) => this.streamError(error)
    this.ws.onmessage = (message) => this.streamMessage(message, callback)
  }

  /**
   * Сообщение потока
  **/
  streamMessage(message, callback) {
    const tick = JSON.parse(message.data)
    callback(tick)
  }

  /**
   * Ошибка потока
  **/
  streamError(error) {
    this.ws.close()
    console.log(error)
  }

}


const stream = new Stream()
const bodyTabl = document.getElementById('body-tabl')

const copy = (text) => {
  UIkit.notification({
    message: 'Скопировано!',
    pos: 'top-center',
    timeout: 1000
  })
  const dummy = document.createElement("input")
  document.body.appendChild(dummy).value = text
  dummy.select()
  document.execCommand("copy")
  document.body.removeChild(dummy)
  // window.navigator.clipboard.writeText(text)
}

stream.listen((data) => {
  const arr = []
  for(let i in data) {
    if (
      Number(data[i].usdtVolUSTD) > 999
      && Number(data[i].btcVolUSTD) > 99
      && Number(data[i].percent) > 0.4
	    && (Number(data[i].btcLiquidity) > 9 || Number(data[i].btcLiquidity) === 100)
    ) {
      arr.push({ ...data[i] })

      const audio = new Audio('../signal.mp3')
      document.body.appendChild(audio)
      audio.play()
      // document.body.removeChild(audio)
    }
  }


  const res = arr.sort((a, b) => Number(a.percent) < Number(b.percent) ? 1 : -1)



  let row = ''
  for(let i in res) {
  // for(let i = 0; i < 10; i++) {
    row += `<tr>
      <td class="table-number">${i}</td>
      <td class="pointer table-text" onclick="copy('${res[i].symbol}')">${res[i].symbol}</td>
      <td class="pointer table-number">
        <span class="pointer table-other-num">${res[i].usdtLiquidity} %</span>
        <span onclick="copy(${res[i].usdtOrderPrice})">${res[i].usdtOrderPrice}</span>
        <span class="pointer table-other-num">${res[i].usdtVolUSTD} USDT</span>
      </td>
      <td class="pointer table-number">
        <span class="pointer table-other-num">${res[i].btcLiquidity} %</span>
        <span onclick="copy(${res[i].btcOrderPrice})">${res[i].btcOrderPrice}</span>
        <span class="pointer table-other-num">${res[i].btcVolUSTD} USDT</span>
      </td>
      <td class="table-number" onclick="copy(${res[i].percent})">${res[i].percent} %</td>
    </tr>`
  }

  if (res.length === 0) {
    document.getElementById('banner').innerHTML = '<div class="banner">Пусто</div>'
  } else {
    document.getElementById('banner').innerHTML = ''
  }
  bodyTabl.innerHTML = row
})
