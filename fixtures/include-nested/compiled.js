(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'include-nested/index.edge');
  out += template.renderInline('include-nested/partial')(template, ctx);
  return out;
})(template, ctx)