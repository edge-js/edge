(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-tag-multiple-sections/index.edge');
  out += 'This is the base template';
  out += '\n';
  out += '';
  out += '\n';
  out += 'Also the header';
  out += '\n';
  out += '';
  out += '\n';
  out += 'I will override the content';
  return out;
})(template, ctx)