let out = ''
let $lineNumber = 1
let $filename = '{{__dirname}}index.edge'
try {
  await template.loopAsync(state.users, async function (user, index) {
    out += '\n'
    $lineNumber = 2
    out += await template.compilePartial('each-tag-include/user', 'user', 'index')(
      template,
      state,
      $context,
      user,
      index
    )
  })
} catch (error) {
  template.reThrow(error, $filename, $lineNumber)
}
return out
