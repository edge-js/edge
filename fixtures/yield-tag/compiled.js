(function (template, ctx) {
  let out = ''
  if(ctx.resolve('username')) {
    out += ctx.resolve('username')
  } else {
  }
  return out
})(template, ctx)