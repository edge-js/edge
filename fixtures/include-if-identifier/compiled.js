let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if (state.username === 'virk') {
out += template.compilePartial(state.partial)(template,state,$context);
}
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;