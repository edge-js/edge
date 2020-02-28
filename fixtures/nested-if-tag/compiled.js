(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'nested-if-tag/index.edge');
  if(ctx.resolve('username')) {
    if(ctx.resolve('age') > 18) {
      out += '    Hello ';
      out += `${ctx.escape(ctx.resolve('username'))}`;
    }
  }
  return out;
})(template, ctx)