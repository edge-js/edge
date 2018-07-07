module.exports = class User {
  constructor (state) {
    this.state = state
  }

  slotTitle (ctx) {
    return ctx.resolve('props').title.toUpperCase()
  }
}