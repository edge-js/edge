(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-props/alert', { 'title': 'H1' }, { 'main': (function (template, ctx) {
return function (props) {
  let out = ''
  ctx.newFrame()
  ctx.setOnFrame('props', props)
  out += 'Hello world'
  out += '\n'
  ctx.removeFrame()
  return out
}
})(template, ctx) })
  return out
})(template, ctx)