(function (template, ctx) {
  let out = '';
  if(ctx.resolve('greeting')) {
    out += ctx.resolve('greeting');
  }
  return out;
})(template, ctx)