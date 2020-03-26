let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if (state.username === "virk") {
out += "  Hello VK";
out += "\n";
$lineNumber = 3;
} else if (state.username) {
out += "  Hello ";
$lineNumber = 4;
out += `${ctx.escape(state.username)}`;
out += "\n";
} else {
out += "  Hello Guest!";
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;