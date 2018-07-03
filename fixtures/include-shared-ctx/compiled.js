(function (template, ctx) {
  let out = ''
  out += template.renderInline('include-shared-ctx/partial')(template, ctx)
  out += '\n'
  return out
})(template, ctx)