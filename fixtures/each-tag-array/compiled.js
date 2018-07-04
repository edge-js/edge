(function (template, ctx) {
  let out = ''
  ctx.loop([{
  username: 'virk'
}], function (user, key) {
    ctx.newFrame()
    ctx.setOnFrame('user', user)
    ctx.setOnFrame('key', key)
    out += '\n'
    out += '  - Hello '
    out += `${ctx.escape(ctx.resolve('user').username)}`
    out += '\n'
    ctx.removeFrame()
  })
  out += '\n'
  return out
})(template, ctx)