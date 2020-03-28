let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if (state.username === "virk") {
out += "\n";
out += "  Hello VK";
$lineNumber = 3;
} else if (state.username) {
out += "\n";
out += "  Hello ";
$lineNumber = 4;
out += `${ctx.escape(state.username)}`;
} else {
out += "\n";
out += "  Hello Guest!";
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;