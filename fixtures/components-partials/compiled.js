(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'components-partials/index.edge');
  out += template.renderWithState('components-partials/alert', { username: 'virk' }, { 'main': (function (template, ctx) {
return function () {
  let slot_0 = '';
  slot_0 += '  Hello ';
  slot_0 += `${ctx.escape(ctx.resolve('username') || 'Guest')}`;
  return slot_0;
};
})(template, ctx) });
  return out;
})(template, ctx)