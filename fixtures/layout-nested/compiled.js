(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'layout-nested/index.edge');
  out += 'I will define the header myself';
  out += '';
  out += '\n';
  out += 'Content from super';
  out += '';
  out += '\n';
  out += 'Appended by index';
  return out;
})(template, ctx)