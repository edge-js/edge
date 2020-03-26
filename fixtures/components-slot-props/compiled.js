let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-slot-props/alert", {}, { main: function () { return "" }, "title": function (user) {
let slot_0 = "";
try {
slot_0 += "    Hello ";
$lineNumber = 3;
slot_0 += `${ctx.escape(user.username)}`;
slot_0 += "\n";
slot_0 += "    Hi ";
$lineNumber = 4;
slot_0 += `${ctx.escape(state.username)}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_0;
} });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;