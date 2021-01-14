let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.compileComponent("components/alert")(template, template.getComponentState({}, { main: function () {
let slot_main = "";
try {
slot_main += "  Hello world";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, line: $lineNumber, col: 0 }));
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;