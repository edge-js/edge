(function (template, ctx) {
  let out = '';
  out += template.renderInline('include-literal/partial')(template, ctx);
  return out;
})(template, ctx)