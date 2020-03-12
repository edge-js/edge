return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
out += "This is the base template";
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)