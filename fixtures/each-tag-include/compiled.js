let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
ctx.loop(state.users, function (user,index) {
out += "\n";
$lineNumber = 2;
out += template.renderInline('each-tag-include/user',"user","index")(template,state,ctx,user,index);
});
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;