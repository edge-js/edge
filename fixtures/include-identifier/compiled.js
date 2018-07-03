(function (template, ctx) {
  let out = ''
  out += template.renderInline(ctx.resolve('partial'))(template, ctx)
  out += '\n'
  return out
})(template, ctx)