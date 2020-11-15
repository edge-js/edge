let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState('share-reference/button', { title: 'Click me' }, { main: function () {
let slot_main = "";
try {
slot_main += " ";
$lineNumber = 2;
slot_main += `${ctx.escape(this.component.title)}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return slot_main;
} }, { filename: $filename, lineNumber: $lineNumber });
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;