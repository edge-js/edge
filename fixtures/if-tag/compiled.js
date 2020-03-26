let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if (state.username) {
out += "  Hello ";
$lineNumber = 2;
out += `${ctx.escape(state.username)}`;
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;