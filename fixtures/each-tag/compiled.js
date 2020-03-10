return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
ctx.loop(ctx.resolve('users'), function (user, loop) {
ctx.newFrame();
ctx.setOnFrame('user', user);
ctx.setOnFrame('$loop', loop);
ctx.setOnFrame('key', loop.key);
out += '  - Hello ';
ctx.$lineNumber = 2;
out += `${ctx.escape(ctx.resolve('user').username)}`;
ctx.removeFrame();
});
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)