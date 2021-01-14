let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
template.loop(state.users, function (user,index) {
out += "\n";
$lineNumber = 2;
out += template.compilePartial('each-tag-include/user',"user","index")(template,state,user,index);
});
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;