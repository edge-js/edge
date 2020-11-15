let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-isolated-state/alert", {}, { main: function () { return "" } }, { filename: $filename, lineNumber: $lineNumber });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;