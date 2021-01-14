let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
$lineNumber = 2;
let username = "virk";
out += "This is the base template";
out += "\n";
out += "";
out += "\n";
out += "Hello ";
$filename = "{{__dirname}}master.edge";
$lineNumber = 4;
out += `${template.escape(username)}`;
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;