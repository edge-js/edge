(function (template, ctx) {
  let out = '';
  if(ctx.resolve('username')) {
    if(ctx.resolve('age') > 18) {
      out += '    Hello ';
      out += `${ctx.escape(ctx.resolve('username'))}`;
    }
  }
  return out;
})(template, ctx)