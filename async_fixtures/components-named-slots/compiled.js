let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-named-slots/alert")(template, template.getComponentState({}, { $context: Object.assign({}, $context), main: async function () { const $context = this.$context;
let slot_main = "";
try {
slot_main += "  Hello ";
$lineNumber = 2;
slot_main += `${template.escape(state.name)}`;
slot_main += " line 1";
slot_main += "\n";
slot_main += "  Hello ";
$lineNumber = 6;
slot_main += `${template.escape(state.name)}`;
slot_main += " line 2";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_main;
}, "heading": async function () { const $context = this.$context;
let slot_1 = "";
try {
slot_1 += "    This is title";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_1;
} }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;