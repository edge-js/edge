let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
ctx.loop([{
  username: "virk"
}], function (user) {
out += "\n";
out += "  - Hello ";
$lineNumber = 2;
out += `${ctx.escape(user.username)}`;
});
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;