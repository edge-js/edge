return (function (template, ctx) {
let out = "";
ctx.$lineNumber = 1;
ctx.$filename = "{{__dirname}}index.edge";
try {
out += template.renderWithState("components-slot-props/alert", {}, { main: function () { return "" }, "title": function (user) {
let slot_0 = "";
try {
ctx.newFrame();
ctx.setOnFrame('user', user);
slot_0 += "    Hello ";
ctx.$lineNumber = 3;
slot_0 += `${ctx.escape(ctx.resolve('user').username)}`;
slot_0 += "\n";
slot_0 += "    Hi ";
ctx.$lineNumber = 4;
slot_0 += `${ctx.escape(ctx.resolve('username'))}`;
ctx.removeFrame();
} catch (error) {
ctx.reThrow(error);
}
return slot_0;
} });
} catch (error) {
ctx.reThrow(error);
}
return out;
})(template, ctx)