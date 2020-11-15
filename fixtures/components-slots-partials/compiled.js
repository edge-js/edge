let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-slots-partials/alert", {}, { main: function () {
let slot_main = "";
try {
$lineNumber = 2;
slot_main += template.renderInline("components-slots-partials/partial")(template,state,ctx);
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, lineNumber: $lineNumber });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;