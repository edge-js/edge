let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
await ctx.loopAsync(state.users, async function (user,index) {
out += "\n";
out += "  - Hello ";
$lineNumber = 2;
out += `${ctx.escape(user.username)}`;
});
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;