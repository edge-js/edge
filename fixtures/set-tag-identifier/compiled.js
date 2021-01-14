let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let username = state.username.split("")[0];
$lineNumber = 2;
out += `${template.escape(username)}`;
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;