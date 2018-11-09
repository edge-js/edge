(function (template, ctx) {
  let out = ''
  if(!ctx.resolve('username')) {
    out += '  Hello Guest'
  }
  return out
})(template, ctx)