let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  out += await template.compilePartial(
    `include-conditionals/${state.username === 'virk' ? 'virk.edge' : 'guest.edge'}`
  )(template, state, $context)
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
