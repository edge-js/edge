(function (template, ctx) {
  let out = ''
  out += template.renderInline(ctx.resolve('partial'))(template, ctx)
  return out
})(template, ctx)