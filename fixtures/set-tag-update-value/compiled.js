let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let username = "nikk";
$lineNumber = 2;
username = "virk";
out += "\n";
$lineNumber = 3;
out += `${ctx.escape(username)}`;
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;