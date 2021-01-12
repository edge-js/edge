let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
if(ctx.size(state.users)) {
await ctx.loopAsync(state.users, async function (user) {
out += "\n";
out += "  - Hello ";
$lineNumber = 2;
out += `${ctx.escape(user.username)}`;
});
} else {
out += "\n";
out += "  No users found";
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;