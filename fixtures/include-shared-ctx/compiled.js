(function (template, ctx) {
  let out = ''
  out += template.renderInline('include-shared-ctx/partial')(template, ctx)
  return out
})(template, ctx)