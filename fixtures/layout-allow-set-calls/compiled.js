(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-allow-set-calls/index.edge');
  ctx.set('username', 'virk');
  out += 'This is the base template';
  out += '\n';
  out += '';
  out += '\n';
  out += 'Hello ';
  out += `${ctx.escape(ctx.resolve('username'))}`;
  return out;
})(template, ctx)