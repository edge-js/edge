(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-props/alert', { 'title': 'H1' }, { 'main': (function (template, ctx) {
  let out = ''
  out += 'Hello world'
  out += '\n'
  return out
})(template, ctx) })
  return out
})(template, ctx)