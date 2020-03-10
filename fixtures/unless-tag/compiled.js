return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
if (!ctx.resolve('age')) {
out += '  Hello ';
ctx.$lineNumber = 2;
out += `${ctx.escape(ctx.resolve('username'))}`;
}
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)