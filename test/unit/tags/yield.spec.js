'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const Template = require('../../../src/Template')
const dedent = require('dedent-js')

test.group('Tags | Yield ', (group) => {
  group.before(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('compile simple yield statement', (assert) => {
    const statement = dedent`
    @!yield(username)
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.resolve('username')}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('compile simple yield statement with fallback content', (assert) => {
    const statement = dedent`
    @yield(username)
      <h2> Hello anonymous </h2>
    @endyield
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (this.context.resolve('username')) {
        out += \`\${this.context.resolve('username')}\\n\`
      } else {
        out += \`  <h2> Hello anonymous </h2>\\n\`
      }
      return out
    }).bind(this)()
    `)
  })
})
