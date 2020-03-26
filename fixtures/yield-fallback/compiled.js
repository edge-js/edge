let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let yield_1 = state.username;
if (yield_1) {
out += `${yield_1}`;
} else {
out += "  Hello ";
$lineNumber = 2;
out += `${ctx.escape(state.guestName)}`;
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;