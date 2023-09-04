const BaseRepository = require('./../repository/base/baseRepository')
const Tax = require('../entities/tax')
const Transaction = require('../entities/transaction')

class CarService {
  constructor({ cars }) {
    this.carRepository = new BaseRepository({ file: cars })
    this.taxesBasedOnAge = Tax.taxesBasedOnAge

    // Usando API de Moeadas
    this.currencyFormat = new Intl.NumberFormat('pt-br', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  getRandomPositionFromArray(list) {
    const listLength = list.length
    return Math.floor(
      Math.random() * (listLength)
    )
  }

  chooseRandomCar(carCategory) {
    console.log("Car category:", carCategory)
    const randomCarIndex = this.getRandomPositionFromArray(carCategory.carIds)
    return carCategory.carIds[randomCarIndex]
  }

  async getAvailableCar(carCategory) {
    const carId = this.chooseRandomCar(carCategory)
    return await this.carRepository.find(carId)
  }

  calculateFinalPrice(customer, carCategory, numberOfDays) {
    const { age } = customer
    const price = carCategory.price
    const { then: tax } = this.taxesBasedOnAge.find(tax => age >= tax.from && age <= tax.to)

    const finalPrice = ((tax * price) * (numberOfDays))
    return this.currencyFormat.format(finalPrice)
  }

  async rent(customer, carCategory, numberOfDays) {
    const car = this.getAvailableCar(carCategory)
    const finalPrice = this.calculateFinalPrice(customer, carCategory, numberOfDays)

    const today = new Date()
    today.setDate(today.getDate() + numberOfDays)
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    const dueDate = today.toLocaleDateString('pt-br', options)

    return new Transaction({
      customer, dueDate, amount: finalPrice
    })
  }
}

module.exports = CarService