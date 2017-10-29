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
const Loader = require('../../../src/Loader')
const Context = require('../../../src/Context')
const dedent = require('dedent-js')
const path = require('path')
const loader = new Loader(path.join(__dirname, '../../../test-helpers/views'))

test.group('Tags | Set ', (group) => {
  group.beforeEach(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse the set block which mutates the data', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('username', 'virk')
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.context.setValue('username', 'virk')
      return out
    }).bind(this)()
    `)
  })

  test('parse the set block with value as an array of data', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('users', ['virk'])
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.context.setValue('users', ['virk'])
      return out
    }).bind(this)()
    `)
  })

  test('parse the set block with value as a reference', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('users', admin.users)
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.context.setValue('users', this.context.accessChild(this.context.resolve('admin'), ['users']))
      return out
    }).bind(this)()
    `)
  })

  test('set literal value at runtime', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('username', 'virk')
    {{ username }}
    `

    this.tags.set.run(Context)
    const output = template.renderString(statement)
    assert.equal(output.trim(), 'virk')
  })

  test('set identifier at runtime', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('username', admin.username)
    {{ username }}
    `

    this.tags.set.run(Context)
    const output = template.renderString(statement, { admin: { username: 'virk' } })
    assert.equal(output.trim(), 'virk')
  })

  test('set array at runtime', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('users', ['virk', 'nikk'])
    {{ users.join(',') }}
    `

    this.tags.set.run(Context)
    const output = template.renderString(statement)
    assert.equal(output.trim(), 'virk,nikk')
  })

  test('set array at runtime', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @set('users', ['virk', 'nikk'])
    {{ users.join(',') }}
    `

    this.tags.set.run(Context)
    const output = template.renderString(statement)
    assert.equal(output.trim(), 'virk,nikk')
  })
})
