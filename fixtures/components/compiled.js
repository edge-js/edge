let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components/alert", {}, { main: function () {
let slot_main = "";
try {
slot_main += "  Hello world";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;