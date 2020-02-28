(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'yield-html/index.edge');
  if(ctx.resolve('greeting')) {
    out += ctx.resolve('greeting');
  }
  return out;
})(template, ctx)