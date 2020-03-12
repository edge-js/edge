return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
if (ctx.resolve('username')) {
ctx.$lineNumber = 2;
if (ctx.resolve('age') > 18) {
out += "    Hello ";
ctx.$lineNumber = 3;
out += `${ctx.escape(ctx.resolve('username'))}`;
}
}
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)