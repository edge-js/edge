let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-slot-props/alert")(template, template.getComponentState({}, { $context: Object.assign({}, $context), main: function () { return "" }, "title": async function (user) { const $context = this.$context;
let slot_1 = "";
try {
slot_1 += "    Hello ";
$lineNumber = 3;
slot_1 += `${template.escape(user.username)}`;
slot_1 += "\n";
slot_1 += "    Hi ";
$lineNumber = 4;
slot_1 += `${template.escape(state.username)}`;
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return slot_1;
} }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;