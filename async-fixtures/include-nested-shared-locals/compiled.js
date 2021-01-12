let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let username = 'virk';
$lineNumber = 2;
out += await template.renderInline("include-nested-shared-locals/partial","username")(template,state,ctx,username);
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;