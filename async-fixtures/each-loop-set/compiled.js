let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let total = 0;
$lineNumber = 2;
await ctx.loopAsync(state.items, async function (item) {
out += "\n";
$lineNumber = 3;
let grossPrice = item.price * item.quantity * state.surcharge;
$lineNumber = 4;
total = total + grossPrice;
out += "- ";
$lineNumber = 5;
out += `${ctx.escape(item.name)}`;
out += " x ";
out += `${ctx.escape(item.quantity)}`;
out += " = ";
out += `${ctx.escape(grossPrice)}`;
});
out += "\n";
out += "Total price = ";
$lineNumber = 7;
out += `${ctx.escape(total)}`;
out += "\n";
out += "Surcharge = ";
$lineNumber = 8;
out += `${ctx.escape(state.surcharge)}`;
out += "\n";
out += "Gross price = ";
$lineNumber = 9;
out += `${ctx.escape(state.grossPrice)}`;
out += " ";
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;