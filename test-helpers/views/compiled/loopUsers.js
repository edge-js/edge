module.exports = function () {
  let out = new String()
  this.context.newFrame()
  this.context.loop(this.context.resolve('users'), (user, loop) => {
    this.context.setOnFrame('user', user)
    this.context.setOnFrame('$loop', loop)
    out += `  ${this.context.escape(this.context.accessChild(this.context.resolve('user'), ['username']))}\n`
  })
  this.context.clearFrame()
  return out
}
