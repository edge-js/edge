let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
debugger;
out += "";
out += "\n";
out += "Hello";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;