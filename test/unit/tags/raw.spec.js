'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const Template = require('../../../src/Template')
const dedent = require('dedent-js')

test.group('Tags | Raw ', (group) => {
  group.before(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse simple raw block to compiled template', (assert) => {
    const statement = dedent`
      @raw
        <p> Hello virk </p>
      @endraw
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`  <p> Hello virk </p>\\n\`
      return out
    }).bind(this)()`)
  })

  test('write tags within raw block to the output', (assert) => {
    const statement = dedent`
      @raw
        @each(user in users)
          <p> {{ user }} </p>
        @endeach
      @endraw
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`  @each(user in users)
          <p> {{ user }} </p>
      @endeach\\n\`
      return out
    }).bind(this)()`)
  })
})
