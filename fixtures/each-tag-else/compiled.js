(function (template, ctx) {
  let out = '';
  ctx.set('$filename', 'each-tag-else/index.edge');
  if(ctx.size(ctx.resolve('users'))) {
    ctx.loop(ctx.resolve('users'), function (user, loop) {
      ctx.newFrame();
      ctx.setOnFrame('user', user);
      ctx.setOnFrame('$loop', loop);
      ctx.setOnFrame('key', loop.key);
      out += '  - Hello ';
      out += `${ctx.escape(ctx.resolve('user').username)}`;
      out += '\n';
      ctx.removeFrame();
    });
  } else {
    out += '  No users found';
  }
  return out;
})(template, ctx)