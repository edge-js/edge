let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-props/alert")(template, template.getComponentState({
  "title": "H1"
}, { $context: Object.assign({}, $context), main: async function () { const $context = this.$context;
let slot_main = "";
try {
slot_main += "Hello world";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;