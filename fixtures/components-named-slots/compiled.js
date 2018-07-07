(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-named-slots/alert', {}, { 'heading': (function (template, ctx) {
return function (props) {
  let out = ''
  ctx.newFrame()
  ctx.setOnFrame('props', props)
  out += '    This is title'
  out += '\n'
  ctx.removeFrame()
  return out
}
})(template, ctx), 'main': (function (template, ctx) {
return function (props) {
  let out = ''
  ctx.newFrame()
  ctx.setOnFrame('props', props)
  out += '  This is then body'
  out += '\n'
  ctx.removeFrame()
  return out
}
})(template, ctx) })
  return out
})(template, ctx)