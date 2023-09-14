/**
 * Составить треугольник
**/
class Triangle {

  /**
   * Сумма расчета
  */
  settlementAmount = 100

  firstData
  secondData
  thirdData

  /**
   * Получить треугольник
   * @param { Object } params.homeDataCoin - Объект домашней монеты (Пример USDT) NEARUSDT
   * @param { Object } params.assetDataCoin - Объект базовой монеты (Пример NEAR) NEARBTC
   * @param { Object } params.quoteDataCoin - Объект котировки (Пример BTC) BTCUSDT
  **/
  getTriangle(params) {
    this.firstData = params.homeDataCoin
    this.secondData = params.assetDataCoin
    this.thirdData = params.quoteDataCoin
    const potential = this.calculateTriangle()
    return {
      ...this.getFirstStep(),
      ...this.getSecondStep(),
      ...this.getThirdStep(),
      potential
    }
  }

  /**
   * Шаг 1 BUY
   * Получить первый шаг
  **/
  getFirstStep() {
    return {
      firstStepBasic: this.firstData.basic, // Базовая
      firstStepQuote: this.firstData.quote, // Котировка
      firstStepPrice: this.firstData.ask, // Цена выставления ордера
      firstStepLiquidity: this.firstData.liquidity, // Ликвидность
      firstStepVolUSTD: Math.round(this.firstData.volume * this.firstData.ask), // Объём в USDT за минуту
      firstStepVolDifference: this.firstData.volumeDifference,
      firstStepAsk: this.firstData.ask,
      firstStepBid: this.firstData.bid,
      firstStepAskQty: this.firstData.askQty,
      firstStepBidQty: this.firstData.bidQty,
      firstStepSpread: this.calculateSpread(
        this.firstData.ask, this.firstData.bid, this.firstData.lotSize
      )
    }
  }

  /**
   * Шаг 2 SELL
   * Получить второй шаг
  **/
  getSecondStep() {
    return {
      secondStepBasic: this.secondData.basic, // Базовая
      secondStepQuote: this.secondData.quote, // Котировка
      secondStepPrice: this.secondData.bid, // Цена выставления ордера
      secondStepLiquidity: this.secondData.liquidity, // Ликвидность
      secondStepVolUSTD: Math.round((this.secondData.volume * this.secondData.bid) * this.thirdData.bid), // Объём в USDT за минуту
      secondStepVolDifference: this.secondData.volumeDifference,
      secondStepAsk: this.secondData.ask,
      secondStepBid: this.secondData.bid,
      secondStepAskQty: this.secondData.askQty,
      secondStepBidQty: this.secondData.bidQty,
      secondStepSpread: this.calculateSpread(
        this.secondData.ask, this.secondData.bid, this.secondData.lotSize
      )
    }
  }

  /**
   * Шаг 3 SELL
   * Получить третий шаг
  **/
  getThirdStep() {
    return {
      thirdStepBasic: this.thirdData.basic, // Базовая
      thirdStepQuote: this.thirdData.quote, // Котировка
      thirdStepPrice: this.thirdData.bid, // Цена выставления ордера
      thirdStepAsk: this.thirdData.ask,
      thirdStepBid: this.thirdData.bid,
      thirdStepAskQty: this.thirdData.askQty,
      thirdStepBidQty: this.thirdData.bidQty,
      thirdStepSpread: this.calculateSpread(
        this.thirdData.ask, this.thirdData.bid, this.thirdData.lotSize
      )
    }
  }

  /**
   * Посчитать спред
  **/
  calculateSpread(ask, bid, lotSize) {
    const stepSize = Number(lotSize.stepSize)
    const spreadPoints = Math.round((ask - bid) / stepSize)
    return spreadPoints
  }

  /**
   * Прссчитать триугольник
   * USDT	-> COIN -> BTC
   * BTC -> USDT
  */
  calculateTriangle() {
    const COIN = this.settlementAmount / this.firstData.ask
    const quantityBtc = this.secondData.bid * COIN
    const result = this.thirdData.bid * quantityBtc
    return Number(
      (100 - (this.settlementAmount * 100 / this.subtractCommission(result))
    ).toFixed(2))
  }

  /**
   * Вычесть комиссию
  */
  subtractCommission(summ) {
    return summ - (0.3 * summ / 100)
  }
}

module.exports = new Triangle()