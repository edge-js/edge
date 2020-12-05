let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-falsy-args/alert", { index: 0 }, { main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;