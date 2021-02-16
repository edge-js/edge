let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  if (state.username) {
    out += '\n'
    out += '  Hello '
    $lineNumber = 2
    out += `${template.escape(state.username)}`
  }
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
