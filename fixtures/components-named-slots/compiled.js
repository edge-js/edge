(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-named-slots/alert', {}, { 'heading': (function (template, ctx) {
return function () {
  let slot_0 = ''
  slot_0 += '    This is title'
  slot_0 += '\n'
  return slot_0
}
})(template, ctx), 'main': (function (template, ctx) {
return function () {
  let slot_1 = ''
  slot_1 += '  This is then body'
  slot_1 += '\n'
  return slot_1
}
})(template, ctx) })
  return out
})(template, ctx)