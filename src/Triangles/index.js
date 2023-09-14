const triangleClass = require('./Triangle')

/**
 * Искать связки
**/
class ConstructTriangles {

  lotSizes
  allTriangles = []
  firstStep
  secondStep
  thirdStep

  /**
   * Получить весь список треугольников
  **/
  getList(params) {
    this.firstStep = params.firstStep
    this.secondStep = params.secondStep
    this.thirdStep = params.thirdStep
    this.lotSizes = params.lotSizes
    this.allTriangles = []

    this.writeValidTrianglesToArray()
    return this.allTriangles
  }

  /**
   * Записать в общий массив валиднве треугольники
  **/
  writeValidTrianglesToArray() {
    const allTrianglesCoin = this.getTrianglesCoin()
    for(let triangle of allTrianglesCoin) {
      const valid = this.checkingTriangleValidity(triangle)
      if (valid) this.allTriangles.push(triangle)   
    }
  }

  /**
   * Получить все треугольники монеты
  **/
  getTrianglesCoin() {
    const triangles = []
    for(let coinName in this.secondStep) {
      if ( typeof this.thirdStep[coinName] !== 'undefined' ) {
        const data = this.getDataForTriangle(this.secondStep[coinName], this.thirdStep[coinName])
        const triangle = triangleClass.getTriangle(data)
        triangles.push(triangle)
      }
    }
    return triangles
  }

  /**
   * Получить данные для треугольника
  */
  getDataForTriangle(secondStep, thirdStep) {
    return {
      homeDataCoin: {
        basic: this.firstStep.basic,
        quote: this.firstStep.quote,
        lotSize: this.lotSizes[this.firstStep.basic + this.firstStep.quote],
        ...this.firstStep
      },
      assetDataCoin: {
        basic: secondStep.basic,
        quote: secondStep.quote,
        lotSize: this.lotSizes[secondStep.basic + secondStep.quote],
        ...secondStep
      },
      quoteDataCoin: {
        basic: thirdStep.basic,
        quote: thirdStep.quote,
        lotSize: this.lotSizes[thirdStep.basic + thirdStep.quote],
        ...thirdStep
      }
    }
  }

  /**
   * Проверка треугольника на валидность
  **/
  checkingTriangleValidity(triangle) {
    for(let i in triangle) {
      if (
        triangle[i] === undefined
        || ( typeof triangle[i] === 'number' && isNaN(triangle[i]) )
      ) return false
    }
    return true
  }

}

module.exports = new ConstructTriangles()