(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'include-conditionals/index.edge');
  out += template.renderInline(`include-conditionals/${ctx.resolve('username') === 'virk' ? 'virk.edge' : 'guest.edge'}`)(template, ctx);
  return out;
})(template, ctx)