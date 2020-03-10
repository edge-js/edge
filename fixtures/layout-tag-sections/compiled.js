return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
out += 'This is the base template';
out += '\n';
out += '';
out += '\n';
out += 'Here goes the content section content';
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)