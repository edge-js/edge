let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.stacks.create('js');
out += "\n";
out += "";
$lineNumber = 3;
let stack_1 = "";
stack_1 += "  \u003Cscript\u003E";
stack_1 += "\n";
stack_1 += "  var a = require('a')";
stack_1 += "\n";
stack_1 += "  \u003C\u002Fscript\u003E";
template.stacks.pushTo('js', stack_1);
out += "\n";
out += "";
$lineNumber = 9;
let stack_2 = "";
stack_2 += "  \u003Cscript\u003E";
stack_2 += "\n";
stack_2 += "  var b = require('b')";
stack_2 += "\n";
stack_2 += "  \u003C\u002Fscript\u003E";
template.stacks.pushTo('js', stack_2);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;