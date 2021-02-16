let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  out += 'This is the base template'
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
