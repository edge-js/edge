(function (template, ctx) {
  let out = '';
  if(ctx.resolve('username')) {
    out += ctx.resolve('username');
  }
  return out;
})(template, ctx)