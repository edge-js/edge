return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
out += `${template.renderInline('include-nested/partial')(template, ctx)}`;
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)