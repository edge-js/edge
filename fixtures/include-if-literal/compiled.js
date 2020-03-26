let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if (state.username === 'virk') {
out += template.renderInline("include-if-literal/partial")(template,state,ctx);
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;