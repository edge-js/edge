(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-props/alert', { 'title': 'H1' }, { 'main': (function (template, ctx) {
return function () {
  let slot_0 = ''
  slot_0 += 'Hello world'
  slot_0 += '\n'
  return slot_0
}
})(template, ctx) })
  return out
})(template, ctx)