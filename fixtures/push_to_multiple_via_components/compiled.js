let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.stacks.create('js');
out += "\n";
$lineNumber = 2;
out += template.compileComponent('push_to_multiple_via_components/script')(template, template.getComponentState({}, { $context: Object.assign({}, $context), main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
out += "\n";
$lineNumber = 3;
out += template.compileComponent('push_to_multiple_via_components/script')(template, template.getComponentState({}, { $context: Object.assign({}, $context), main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;