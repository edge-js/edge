return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
let yield_1 = ctx.resolve('username');
if (yield_1) {
out += `${yield_1}`;
}
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)