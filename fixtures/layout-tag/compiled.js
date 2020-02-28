(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-tag/index.edge');
  out += 'This is the base template';
  return out;
})(template, ctx)