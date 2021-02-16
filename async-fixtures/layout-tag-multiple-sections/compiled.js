let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  out += 'This is the base template'
  out += '\n'
  out += ''
  out += '\n'
  out += 'Also the header'
  out += '\n'
  out += ''
  out += '\n'
  out += 'I will override the content'
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
