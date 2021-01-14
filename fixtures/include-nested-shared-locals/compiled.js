let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let username = 'virk';
$lineNumber = 2;
out += template.compilePartial("include-nested-shared-locals/partial","username")(template,state,username);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;