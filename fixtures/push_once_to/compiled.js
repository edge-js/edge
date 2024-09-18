let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.stacks.create('js');
out += "\n";
$lineNumber = 2;
out += template.compilePartial('push_once_to/script')(template,state,$context);
out += "\n";
$lineNumber = 3;
out += template.compilePartial('push_once_to/script')(template,state,$context);
out += "\n";
$lineNumber = 4;
out += template.compilePartial('push_once_to/script')(template,state,$context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;