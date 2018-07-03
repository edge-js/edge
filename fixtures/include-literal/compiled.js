(function (template, ctx) {
  let out = ''
  out += template.renderInline('include-literal/partial')(template, ctx)
  out += '\n'
  return out
})(template, ctx)