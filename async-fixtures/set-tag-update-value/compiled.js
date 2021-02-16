let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  let username = 'nikk'
  $lineNumber = 2
  username = 'virk'
  $lineNumber = 3
  out += `${template.escape(username)}`
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
