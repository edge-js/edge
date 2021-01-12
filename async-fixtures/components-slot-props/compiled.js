let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.renderWithState("components-slot-props/alert", {}, { main: function () { return "" }, "title": async function (user) {
let slot_1 = "";
try {
slot_1 += "    Hello ";
$lineNumber = 3;
slot_1 += `${ctx.escape(user.username)}`;
slot_1 += "\n";
slot_1 += "    Hi ";
$lineNumber = 4;
slot_1 += `${ctx.escape(state.username)}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_1;
} }, { filename: $filename, line: $lineNumber, col: 0 });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;