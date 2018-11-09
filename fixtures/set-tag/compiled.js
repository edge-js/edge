(function (template, ctx) {
  let out = ''
  ctx.set('username', 'nikk')
  out += `${ctx.escape(ctx.resolve('username'))}`
  return out
})(template, ctx)