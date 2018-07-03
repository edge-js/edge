(function (template, ctx) {
  let out = ''
  out += template.renderInline(`include-conditionals/${ctx.resolve('username') === 'virk' ? 'virk.edge' : 'guest.edge'}`)(template, ctx)
  out += '\n'
  return out
})(template, ctx)