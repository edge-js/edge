(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-tag-override-sections/index.edge');
  out += 'This is the base template';
  out += '\n';
  out += '';
  out += '\n';
  out += 'I will override the base content';
  return out;
})(template, ctx)