let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let username = 'virk';
$lineNumber = 2;
out += await template.compilePartial("include-nested-shared-locals/partial","username")(template,state,$context,username);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;