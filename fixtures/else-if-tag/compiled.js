(function (template, ctx) {
  let out = ''
  if(ctx.resolve('username') === 'virk') {
    out += '  Hello VK'
    out += '\n'
  } else if(ctx.resolve('username')) {
    out += '  Hello '
    out += `${ctx.escape(ctx.resolve('username'))}`
    out += '\n'
  } else {
    out += '  Hello Guest!'
  }
  return out
})(template, ctx)