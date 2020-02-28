(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'include-identifier/index.edge');
  out += template.renderInline(ctx.resolve('partial'))(template, ctx);
  return out;
})(template, ctx)