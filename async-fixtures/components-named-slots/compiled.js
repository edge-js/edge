let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.renderWithState("components-named-slots/alert", {}, { main: async function () {
let slot_main = "";
try {
slot_main += "  Hello ";
$lineNumber = 2;
slot_main += `${ctx.escape(state.name)}`;
slot_main += " line 1";
slot_main += "\n";
slot_main += "  Hello ";
$lineNumber = 6;
slot_main += `${ctx.escape(state.name)}`;
slot_main += " line 2";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
}, "heading": async function () {
let slot_1 = "";
try {
slot_1 += "    This is title";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_1;
} }, { filename: $filename, line: $lineNumber, col: 0 });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;