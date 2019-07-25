(function (template, ctx) {
  let out = '';
  out += template.renderWithState('components-state/alert', {}, { 'main': (function (template, ctx) {
return function () {
  let slot_0 = '';
  slot_0 += '  Hello ';
  slot_0 += `${ctx.escape(ctx.resolve('username'))}`;
  return slot_0;
};
})(template, ctx) });
  return out;
})(template, ctx)