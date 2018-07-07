(function (template, ctx) {
  let out = ''
  ctx.set('username', ctx.resolve('username').split('')[0])
  out += `${ctx.escape(ctx.resolve('username'))}`
  out += '\n'
  return out
})(template, ctx)