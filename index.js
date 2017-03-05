module.exports = function () {
  let out = new String()
  out += `Hello ${this.escape(this.resolve('username'))}`
  return out
}
