(function (template, ctx) {
  let out = ''
  ctx.set('username', 'nikk')
  out += `${ctx.escape(ctx.resolve('username'))}`
  out += '\n'
  return out
})(template, ctx)