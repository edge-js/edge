(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'include-literal/index.edge');
  out += template.renderInline('include-literal/partial')(template, ctx);
  return out;
})(template, ctx)