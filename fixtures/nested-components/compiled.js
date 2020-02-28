(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'nested-components/index.edge');
  out += template.renderWithState('nested-components/alert', {}, { 'main': (function (template, ctx) {
return function () {
  let slot_0 = '';
  slot_0 += '  Hello world';
  return slot_0;
};
})(template, ctx) });
  return out;
})(template, ctx)