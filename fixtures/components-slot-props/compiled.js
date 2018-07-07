(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-slot-props/alert', {}, { 'title': (function (template, ctx) {
return function (props) {
  let out = ''
  ctx.newFrame()
  ctx.setOnFrame('props', props)
  out += '    Hello '
  out += `${ctx.escape(ctx.resolve('props').username)}`
  out += '\n'
  ctx.removeFrame()
  return out
}
})(template, ctx) })
  return out
})(template, ctx)