(function (template, ctx) {
  let out = ''
  ctx.set('username', ctx.resolve('username').split('')[0])
  out += `${ctx.escape(ctx.resolve('username'))}`
  return out
})(template, ctx)