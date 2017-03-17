module.exports = function () {
  let out = new String()
  out += `<!DOCTYPE html>\n`
  out += `<html lang="en">\n`
  out += `<head>\n`
  out += `  <meta charset="UTF-8">\n`
  out += `  <title></title>\n`
  out += `</head>\n`
  out += `<body>\n`
  out += `\n`
  out += `  <ul>\n`
  this.context.newFrame()
  this.context.loop(this.context.resolve('users'), (user, loop) => {
    this.context.setOnFrame('user', user)
    this.context.setOnFrame('$loop', loop)
    out += `<li>\n`
    out += `  <strong>Username: </strong> ${this.context.escape(this.context.accessChild(this.context.resolve('user'), ['username']))} | <strong>Age: </strong> ${this.context.escape(this.context.accessChild(this.context.resolve('user'), ['age']))}\n`
    out += `</li>\n`
  })
  this.context.clearFrame()
  out += `  </ul>\n`
  out += `\n`
  out += `</body>\n`
  out += `</html>\n`
  return out
}