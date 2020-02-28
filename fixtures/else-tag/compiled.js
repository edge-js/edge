(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'else-tag/index.edge');
  if(ctx.resolve('username')) {
    out += '  Hello ';
    out += `${ctx.escape(ctx.resolve('username'))}`;
    out += '\n';
  } else {
    out += '  Hello guest!';
  }
  return out;
})(template, ctx)