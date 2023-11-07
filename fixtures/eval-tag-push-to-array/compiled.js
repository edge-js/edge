let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
state.users.push({
  username: 'romain'
});
$lineNumber = 2;
template.loop(state.users, function (user) {
out += "\n";
out += "  - ";
$lineNumber = 3;
out += `${template.escape(user.username)}`;
});
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;