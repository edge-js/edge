(function (template, ctx) {
  let out = ''
  out += template.renderInline('include-nested/partial')(template, ctx)
  out += '\n'
  return out
})(template, ctx)