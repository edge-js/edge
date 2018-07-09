(function (template, ctx) {
  let out = ''
  if(ctx.resolve('username')) {
    out += ctx.resolve('username')
  } else {
    out += '  Hello guest'
    out += '\n'
  }
  return out
})(template, ctx)