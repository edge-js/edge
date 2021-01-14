let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += "\n";
out += "I will define the header myself";
out += "\n";
out += "\n";
out += "Content from super";
out += "\n";
out += "Appended by index";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;