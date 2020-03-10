return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
if (ctx.resolve('username')) {
out += '  Hello ';
ctx.$lineNumber = 2;
out += `${ctx.escape(ctx.resolve('username'))}`;
out += '\n';
} else {
out += '  Hello guest!';
}
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)