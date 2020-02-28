(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'components-isolated-state/index.edge');
  out += template.renderWithState('components-isolated-state/alert', {}, {  });
  return out;
})(template, ctx)