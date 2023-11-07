let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-spread-and-literal/alert")(template, template.getComponentState({
  ...state.data,
  name: 'virk'
}, { $context: Object.assign({}, $context), main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;