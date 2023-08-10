let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
template.loop(state.users, function (user) {
out += "\n";
$lineNumber = 2;
let index = 0;
$lineNumber = 3;
index = index + 1;
out += "  ";
$lineNumber = 4;
out += `${template.escape(index)}`;
});
$lineNumber = 6;
state.index = (state.index || 0) + 1;
out += "";
out += "\n";
$lineNumber = 8;
out += `${template.escape(state.index)}`;
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;