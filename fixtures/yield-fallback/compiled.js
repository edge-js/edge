(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'yield-fallback/index.edge');
  if(ctx.resolve('username')) {
    out += ctx.resolve('username');
  } else {
    out += '  Hello guest';
  }
  return out;
})(template, ctx)