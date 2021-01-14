let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.compilePartial("include-literal/partial")(template,state,$context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;