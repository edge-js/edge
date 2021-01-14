let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.compileComponent("components-slots-partials/alert")(template, template.getComponentState({}, { $context: Object.assign({}, $context), main: function () { const $context = this.$context;
let slot_main = "";
try {
$lineNumber = 2;
slot_main += template.compilePartial("components-slots-partials/partial")(template,state,$context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;