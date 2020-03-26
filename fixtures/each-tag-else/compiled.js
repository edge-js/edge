let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if(ctx.size(state.users)) {
ctx.loop(state.users, function (user) {
out += "  - Hello ";
$lineNumber = 2;
out += `${ctx.escape(user.username)}`;
out += "\n";
});
} else {
out += "  No users found";
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;