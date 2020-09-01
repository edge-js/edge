let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += "This is the base template";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;