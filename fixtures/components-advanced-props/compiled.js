let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-advanced-props/button", { class: 'mb-4 px-4', id: 'foo-bar', title: 'Click me' }, { main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;