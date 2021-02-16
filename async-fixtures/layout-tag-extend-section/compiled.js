let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += "This is the base template";
out += "\n";
out += "Hello ";
$filename = "{{__dirname}}master.edge";
$lineNumber = 3;
out += `${template.escape(state.username)}`;
out += " from layout";
out += "\n";
out += "Hello ";
$filename = "{{__dirname}}index.edge";
$lineNumber = 4;
out += `${template.escape(state.username)}`;
out += " from children";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;