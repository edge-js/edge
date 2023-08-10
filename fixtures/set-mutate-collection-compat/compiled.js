let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let counter = {
  value: 0
};
$lineNumber = 2;
template.setValue(counter, 'value', 1);
$lineNumber = 3;
out += `${template.escape(counter.value)}`;
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;