(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-named-slots/alert', {}, { 'heading': (function (template, ctx) {
  let out = ''
  out += '    This is title'
  out += '\n'
  return out
})(template, ctx), 'main': (function (template, ctx) {
  let out = ''
  out += '  This is then body'
  out += '\n'
  return out
})(template, ctx) })
  return out
})(template, ctx)