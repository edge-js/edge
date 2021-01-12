let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.renderInline(`include-conditionals/${state.username === "virk" ? "virk.edge" : "guest.edge"}`)(template,state,ctx);
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;