let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
template.loop(state.users, function (user) {
out += "\n";
out += "  - Hello ";
$lineNumber = 2;
out += `${template.escape(user.username)}`;
});
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;