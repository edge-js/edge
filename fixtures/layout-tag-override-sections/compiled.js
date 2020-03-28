let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += "\n";
out += "This is the base template";
out += "\n";
out += "";
out += "\n";
out += "I will override the base content";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;