let out = "";
let $lineNumber = 1;
let $filename = "{{__dirname}}index.edge";
try {
let yield_1 = state.greeting;
if (yield_1) {
out += `${yield_1}`;
}
} catch (error) {
ctx.reThrow(error, $filename, $lineNumber);
}
return out;