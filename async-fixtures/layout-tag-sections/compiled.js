let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  out += 'This is the base template'
  out += '\n'
  out += ''
  out += '\n'
  out += 'Here goes the content section content'
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
