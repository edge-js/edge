return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
ctx.set('total', 0, false);
ctx.$lineNumber = 2;
ctx.set('grossPrice', 0, false);
ctx.$lineNumber = 3;
ctx.loop(ctx.resolve('items'), function (item, loop) {
ctx.newFrame();
ctx.setOnFrame('item', item);
ctx.setOnFrame('$loop', loop);
ctx.setOnFrame('key', loop.key);
ctx.$lineNumber = 4;
ctx.set('grossPrice', ctx.resolve('item').price * ctx.resolve('item').quantity, true);
ctx.$lineNumber = 5;
ctx.set('total', ctx.resolve('total') + ctx.resolve('grossPrice'), false);
out += '';
out += '\n';
out += '- ';
ctx.$lineNumber = 7;
out += `${ctx.escape(ctx.resolve('item').name)}`;
out += ' x ';
out += `${ctx.escape(ctx.resolve('item').quantity)}`;
out += ' = ';
out += `${ctx.escape(ctx.resolve('grossPrice'))}`;
ctx.removeFrame();
});
out += '\n';
out += 'Total price = ';
ctx.$lineNumber = 9;
out += `${ctx.escape(ctx.resolve('total'))}`;
out += '\n';
out += 'Gross price = ';
ctx.$lineNumber = 10;
out += `${ctx.escape(ctx.resolve('grossPrice'))}`;
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)