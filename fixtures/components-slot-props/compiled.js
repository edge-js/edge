(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'components-slot-props/index.edge');
  out += template.renderWithState('components-slot-props/alert', {}, { 'title': (function (template, ctx) {
return function (user) {
  let slot_0 = '';
  ctx.newFrame();
  ctx.setOnFrame('user', user);
  slot_0 += '    Hello ';
  slot_0 += `${ctx.escape(ctx.resolve('user').username)}`;
  ctx.removeFrame();
  return slot_0;
};
})(template, ctx) });
  return out;
})(template, ctx)