(function (template, ctx) {
  let out = ''
  out += template.renderInline('include-nested/partial')(template, ctx)
  return out
})(template, ctx)