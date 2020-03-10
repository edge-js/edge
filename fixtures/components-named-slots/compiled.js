return (function (template, ctx) {
let out = '';
ctx.$lineNumber = 1;
ctx.$filename = '{{__dirname}}index.edge';
try {
out += template.renderWithState('components-named-slots/alert', {}, { main: function () {
let slot_main = '';
try {
slot_main += '  Hello ';
ctx.$lineNumber = 2;
slot_main += `${ctx.escape(ctx.resolve('name'))}`;
slot_main += ' line 1';
slot_main += '\n';
slot_main += '\n';
slot_main += '  Hello ';
ctx.$lineNumber = 6;
slot_main += `${ctx.escape(ctx.resolve('name'))}`;
slot_main += ' line 2';
} catch (error) {
ctx.reThrow(error);
}
return slot_main;
}, 'heading': function () {
let slot_4 = '';
try {
slot_4 += '    This is title';
} catch (error) {
ctx.reThrow(error);
}
return slot_4;
} });
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)