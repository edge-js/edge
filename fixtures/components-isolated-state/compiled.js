return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-isolated-state/alert", {}, { main: function () { return "" } });
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)