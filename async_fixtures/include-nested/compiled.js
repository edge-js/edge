let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compilePartial("include-nested/partial")(template,state,$context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;