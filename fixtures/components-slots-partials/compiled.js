return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
out += template.renderWithState('components-slots-partials/alert', {}, { main: function () {
let slot_main = '';
try {
ctx.$lineNumber = 2;
slot_main += `${template.renderInline('components-slots-partials/partial')(template, ctx)}`;
} catch (error) {
ctx.reThrow(error);
}
return slot_main;
} });
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)