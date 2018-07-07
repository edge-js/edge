(function (template, ctx) {
  let out = ''
  if(!ctx.resolve('username')) {
    out += '  Hello Guest'
    out += '\n'
  }
  return out
})(template, ctx)