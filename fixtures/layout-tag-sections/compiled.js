(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-tag-sections/index.edge');
  out += 'This is the base template';
  out += '\n';
  out += '';
  out += '\n';
  out += 'Here goes the content section content';
  return out;
})(template, ctx)