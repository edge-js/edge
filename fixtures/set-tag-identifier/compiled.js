let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let username = state.username.split("")[0];
out += "\n";
$lineNumber = 2;
out += `${ctx.escape(username)}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;