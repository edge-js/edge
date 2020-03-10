return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
out += 'This is the base template';
out += '\n';
out += '';
out += '\n';
out += 'Also the header';
out += '\n';
out += '';
out += '\n';
out += 'I will override the content';
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)