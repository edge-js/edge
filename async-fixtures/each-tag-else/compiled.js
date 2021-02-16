let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  if (template.size(state.users)) {
    await template.loopAsync(state.users, async function (user) {
      out += '\n'
      out += '  - Hello '
      $lineNumber = 2
      out += `${template.escape(user.username)}`
    })
  } else {
    out += '\n'
    out += '  No users found'
  }
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
