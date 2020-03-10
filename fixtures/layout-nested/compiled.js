return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
out += 'I will define the header myself';
out += '';
out += '\n';
out += 'Content from super';
out += '';
out += '\n';
out += 'Appended by index';
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)