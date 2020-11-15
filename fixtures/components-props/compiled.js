let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-props/alert", { "title": "H1" }, { main: function () {
let slot_main = "";
try {
slot_main += "Hello world";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, lineNumber: $lineNumber });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;