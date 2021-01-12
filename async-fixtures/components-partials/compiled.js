let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.renderWithState("components-partials/alert", { username: "virk" }, { main: async function () {
let slot_main = "";
try {
slot_main += "  Hello ";
$lineNumber = 2;
slot_main += `${ctx.escape(state.username || "Guest")}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, line: $lineNumber, col: 0 });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;