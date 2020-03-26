let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += "I will define the header myself";
out += "";
out += "\n";
out += "Content from super";
out += "";
out += "\n";
out += "Appended by index";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;