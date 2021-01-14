let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-slot-props/alert")(template, template.getComponentState({}, { main: function () { return "" }, "title": async function (user) {
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
} }, { filename: $filename, line: $lineNumber, col: 0 }));
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;