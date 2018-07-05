(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components/alert', {}, { 'main': (function (template, ctx) {
  let out = ''
  out += '  Hello world'
  out += '\n'
  return out
})(template, ctx) })
  return out
})(template, ctx)