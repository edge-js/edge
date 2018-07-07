(function (template, ctx) {
  let out = ''
  out += template.renderWithState('components-slots-partials/alert', {}, { 'main': (function (template, ctx) {
return function () {
  let slot_0 = ''
  slot_0 += template.renderInline('components-slots-partials/partial')(template, ctx)
  return slot_0
}
})(template, ctx) })
  return out
})(template, ctx)