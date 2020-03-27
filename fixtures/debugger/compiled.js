let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
debugger;
out += "\n";
out += "";
out += "\n";
out += "Hello";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;