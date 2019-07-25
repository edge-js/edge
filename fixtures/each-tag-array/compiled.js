(function (template, ctx) {
  let out = '';
  ctx.loop([{
  username: 'virk'
}], function (user, loop) {
    ctx.newFrame();
    ctx.setOnFrame('user', user);
    ctx.setOnFrame('$loop', loop);
    ctx.setOnFrame('key', loop.key);
    out += '  - Hello ';
    out += `${ctx.escape(ctx.resolve('user').username)}`;
    ctx.removeFrame();
  });
  return out;
})(template, ctx)