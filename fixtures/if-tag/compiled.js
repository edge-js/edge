(function (template, ctx) {
  let out = ''
  if(ctx.resolve('username')) {
    out += '  Hello '
    out += `${ctx.escape(ctx.resolve('username'))}`
    out += '\n'
  }
  return out
})(template, ctx)