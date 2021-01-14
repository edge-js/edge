let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-slots-partials/alert")(template, template.getComponentState({}, { main: async function () {
let slot_main = "";
try {
$lineNumber = 2;
slot_main += await template.compilePartial("components-slots-partials/partial")(template,state);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, line: $lineNumber, col: 0 }));
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;