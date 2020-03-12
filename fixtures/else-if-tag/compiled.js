return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
if (ctx.resolve('username') === "virk") {
out += "  Hello VK";
out += "\n";
ctx.$lineNumber = 3;
} else if (ctx.resolve('username')) {
out += "  Hello ";
ctx.$lineNumber = 4;
out += `${ctx.escape(ctx.resolve('username'))}`;
out += "\n";
} else {
out += "  Hello Guest!";
}
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)