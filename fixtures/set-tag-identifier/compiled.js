return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
ctx.set("username", ctx.resolve('username').split("")[0], false);
ctx.$lineNumber = 2;
out += `${ctx.escape(ctx.resolve('username'))}`;
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)