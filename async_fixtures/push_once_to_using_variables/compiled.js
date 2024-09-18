let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.stacks.create(state.stackName);
out += "\n";
$lineNumber = 2;
out += await template.compilePartial('push_once_to_using_variables/script')(template,state,$context);
out += "\n";
$lineNumber = 3;
out += await template.compilePartial('push_once_to_using_variables/script')(template,state,$context);
out += "\n";
$lineNumber = 4;
out += await template.compilePartial('push_once_to_using_variables/script')(template,state,$context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;