(function (template, ctx) {
  let out = ''
  ctx.loop([{
  username: 'virk'
}], function (user, key) {
    ctx.newFrame()
    ctx.setOnFrame('user', user)
    ctx.setOnFrame('key', key)
    out += '  - Hello '
    out += `${ctx.escape(ctx.resolve('user').username)}`
    out += '\n'
    ctx.removeFrame()
  })
  return out
})(template, ctx)