let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += "\n";
out += "This is the base template";
out += "\n";
out += "Hello ";
$filename = "{{__dirname}}master.edge";
$lineNumber = 3;
out += `${ctx.escape(state.username)}`;
out += " from layout";
out += "\n";
out += "Hello ";
$filename = "{{__dirname}}index.edge";
$lineNumber = 4;
out += `${ctx.escape(state.username)}`;
out += " from children";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;