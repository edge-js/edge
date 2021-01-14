let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let total = 0;
$lineNumber = 2;
template.loop(state.items, function (item) {
out += "\n";
$lineNumber = 3;
let grossPrice = item.price * item.quantity * state.surcharge;
$lineNumber = 4;
total = total + grossPrice;
out += "- ";
$lineNumber = 5;
out += `${template.escape(item.name)}`;
out += " x ";
out += `${template.escape(item.quantity)}`;
out += " = ";
out += `${template.escape(grossPrice)}`;
});
out += "\n";
out += "Total price = ";
$lineNumber = 7;
out += `${template.escape(total)}`;
out += "\n";
out += "Surcharge = ";
$lineNumber = 8;
out += `${template.escape(state.surcharge)}`;
out += "\n";
out += "Gross price = ";
$lineNumber = 9;
out += `${template.escape(state.grossPrice)}`;
out += " ";
} catch (error) {
template.reThrow(error, $filename, $lineNumber);
}
return out;