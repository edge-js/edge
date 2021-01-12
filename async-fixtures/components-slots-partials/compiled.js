let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.renderWithState("components-slots-partials/alert", {}, { main: async function () {
let slot_main = "";
try {
$lineNumber = 2;
slot_main += await template.renderInline("components-slots-partials/partial")(template,state,ctx);
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, line: $lineNumber, col: 0 });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;