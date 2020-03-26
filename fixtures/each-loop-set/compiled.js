let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let total = 0;
$lineNumber = 2;
ctx.loop(state.items, function (item) {
$lineNumber = 3;
let grossPrice = item.price * item.quantity * state.surcharge;
$lineNumber = 4;
total = total + grossPrice;
out += "";
out += "\n";
out += "- ";
$lineNumber = 6;
out += `${ctx.escape(item.name)}`;
out += " x ";
out += `${ctx.escape(item.quantity)}`;
out += " = ";
out += `${ctx.escape(grossPrice)}`;
});
out += "\n";
out += "Total price = ";
$lineNumber = 8;
out += `${ctx.escape(total)}`;
out += "\n";
out += "Surcharge = ";
$lineNumber = 9;
out += `${ctx.escape(state.surcharge)}`;
out += "\n";
out += "Gross price = ";
$lineNumber = 10;
out += `${ctx.escape(state.grossPrice)}`;
out += " ";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;