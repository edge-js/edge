(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-state/alert', {}, { 'main': (function (template, ctx) {
  let out = ''
  out += '  Hello '
  out += `${ctx.escape(ctx.resolve('username'))}`
  out += '\n'
  return out
})(template, ctx) })
  return out
})(template, ctx)