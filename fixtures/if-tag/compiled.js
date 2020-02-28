(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'if-tag/index.edge');
  if(ctx.resolve('username')) {
    out += '  Hello ';
    out += `${ctx.escape(ctx.resolve('username'))}`;
  }
  return out;
})(template, ctx)