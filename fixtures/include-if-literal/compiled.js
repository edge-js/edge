let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if (state.username === 'virk') {
out += template.compilePartial("include-if-literal/partial")(template,state);
}
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;