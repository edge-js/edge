let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
ctx.loop(state.users, function (user) {
out += "  - Hello ";
$lineNumber = 2;
out += `${ctx.escape(user.username)}`;
});
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;