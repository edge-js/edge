(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'include-shared-ctx/index.edge');
  out += template.renderInline('include-shared-ctx/partial')(template, ctx);
  return out;
})(template, ctx)