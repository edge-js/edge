(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'unless-tag/index.edge');
  if(!ctx.resolve('username')) {
    out += '  Hello Guest';
  }
  return out;
})(template, ctx)