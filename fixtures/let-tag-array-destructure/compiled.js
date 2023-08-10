let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let [username, age] = state.user;
$lineNumber = 2;
out += `${template.escape(username)}`;
out += ", ";
out += `${template.escape(age)}`;
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;