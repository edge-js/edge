return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
debugger;
out += "";
out += "\n";
out += "Hello";
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)