(function (template, ctx) {
  let out = ''
  if(ctx.resolve('greeting')) {
    out += ctx.resolve('greeting')
  } else {
  }
  return out
})(template, ctx)