let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += template.compileComponent("components-props-as-reference/alert")(template, template.getComponentState(state.data, { $context: Object.assign({}, $context), main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;