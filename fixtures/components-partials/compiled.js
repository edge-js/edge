(function (template, ctx) {
  let out = '';
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