return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
ctx.$lineNumber = 2;
ctx.set('username', 'virk', false);
out += 'This is the base template';
out += '\n';
out += '';
out += '\n';
out += 'Hello ';
ctx.$filename = '{{__dirname}}master.edge';
ctx.$lineNumber = 4;
out += `${ctx.escape(ctx.resolve('username'))}`;
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)