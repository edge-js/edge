let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
out += await template.compileComponent("components-advanced-props-compat/button")(template, template.getComponentState({
  class: 'mb-4 px-4',
  id: 'foo-bar',
  title: 'Click me'
}, { $context: Object.assign({}, $context), main: function () { return "" } }, { filename: $filename, line: $lineNumber, col: 0 }), $context);
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;