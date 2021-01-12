let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.renderInline(state.partial)(template,state,ctx);
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;