(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-tag-extend-section/index.edge');
  out += 'This is the base template';
  out += '\n';
  out += '';
  out += '\n';
  out += 'Here goes the content section content';
  out += '';
  out += '\n';
  out += 'I will extend the content of my parent';
  return out;
})(template, ctx)