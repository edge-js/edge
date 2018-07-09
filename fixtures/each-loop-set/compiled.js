(function (template, ctx) {
  let out = ''
  ctx.set('total', 0)
  ctx.loop(ctx.resolve('items'), function (item, loop) {
    ctx.newFrame()
    ctx.setOnFrame('item', item)
    ctx.setOnFrame('$loop', loop)
    ctx.setOnFrame('key', loop.key)
    ctx.set('grossPrice', ctx.resolve('item').price * ctx.resolve('item').quantity)
    ctx.set('total', ctx.resolve('total') + ctx.resolve('grossPrice'))
    out += '- '
    out += `${ctx.escape(ctx.resolve('item').name)}`
    out += ' x '
    out += `${ctx.escape(ctx.resolve('item').quantity)}`
    out += ' = '
    out += `${ctx.escape(ctx.resolve('grossPrice'))}`
    out += '\n'
    ctx.removeFrame()
  })
  out += 'Total price = '
  out += `${ctx.escape(ctx.resolve('total'))}`
  out += '\n'
  return out
})(template, ctx)