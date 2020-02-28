(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'yield-tag/index.edge');
  if(ctx.resolve('username')) {
    out += ctx.resolve('username');
  }
  return out;
})(template, ctx)