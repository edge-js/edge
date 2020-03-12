return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
out += "This is the base template";
out += "\n";
out += "";
out += "\n";
out += "Hello ";
ctx.$filename = "{{__dirname}}master.edge";
ctx.$lineNumber = 4;
out += `${ctx.escape(ctx.resolve('username'))}`;
out += " from layout";
out += "";
out += "\n";
out += "Hello ";
ctx.$filename = "{{__dirname}}index.edge";
ctx.$lineNumber = 6;
out += `${ctx.escape(ctx.resolve('username'))}`;
out += " from children";
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)