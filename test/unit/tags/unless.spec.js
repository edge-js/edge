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

test.group('Tags | Unless ', (group) => {
  group.before(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse simple unless block to compiled template', (assert) => {
    const statement = dedent`
      @unless(username === 'virk')
        <p> Hello virk </p>
      @endunless
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(this.context.resolve('username') === 'virk')) {
        out += \`  <p> Hello virk </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse block with else', (assert) => {
    const statement = dedent`
    @unless(username === 'virk')
      <p> Hello virk </p>
    @else
      <p> Hello anonymous </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(this.context.resolve('username') === 'virk')) {
        out += \`  <p> Hello virk </p>\\n\`
      } else {
        out += \`  <p> Hello anonymous </p>\\n\`
      }
      return out
    }).bind(this)()
    `)
  })

  test('parse block with literal inside unless', (assert) => {
    const statement = dedent`
    @unless('virk')
      <p> Hello virk </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!('virk')) {
        out += \`  <p> Hello virk </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse block with identifier inside unless', (assert) => {
    const statement = dedent`
    @unless(username)
      <p> Hello {{ username }} </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(this.context.resolve('username'))) {
        out += \`  <p> Hello \${this.context.escape(this.context.resolve('username'))} </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse block with arithmetic expression', (assert) => {
    const statement = dedent`
    @unless(2 + 2)
      <p> It is {{ 2 + 2 }} </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(2 + 2)) {
        out += \`  <p> It is \${this.context.escape(2 + 2)} </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse block with arithmatic and binary expression expression', (assert) => {
    const statement = dedent`
    @unless(2 + 2 === cartTotal)
      <p> Hello {{ cartTotal }} </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(2 + 2 === this.context.resolve('cartTotal'))) {
        out += \`  <p> Hello \${this.context.escape(this.context.resolve('cartTotal'))} </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse when a function has been passed', (assert) => {
    const statement = dedent`
    @unless(count(users))
      <p> There are {{ count(users) }} </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(this.context.callFn('count', [this.context.resolve('users')]))) {
        out += \`  <p> There are \${this.context.escape(this.context.callFn('count', [this.context.resolve('users')]))} </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse when a native function is called', (assert) => {
    const statement = dedent`
    @unless(users.indexOf('virk') > -1)
      <p> Hello {{ users['virk'] }} </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(this.context.resolve('users').indexOf('virk') > -1)) {
        out += \`  <p> Hello \${this.context.escape(this.context.accessChild(this.context.resolve('users'), ['virk']))} </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('parse when a property accessor is passed', (assert) => {
    const statement = dedent`
    @unless(user.isLoggedIn)
      <p> Hello {{ user.username }} </p>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(this.context.accessChild(this.context.resolve('user'), ['isLoggedIn']))) {
        out += \`  <p> Hello \${this.context.escape(this.context.accessChild(this.context.resolve('user'), ['username']))} </p>\\n\`
      }
      return out
    }).bind(this)()`)
  })

  test('throw exception when assignment expression is passed', (assert) => {
    const statement = dedent`
    @unless(age = 22)
      <p> You are 22 years old </p>
    @endunless`

    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <age = 22> passed to (unless) block')
  })

  test('throw exception when sequence expression is passed', (assert) => {
    const statement = dedent`
    @unless(age, username)
      <p> You are 22 years old </p>
    @endunless`

    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <age, username> passed to (unless) block')
  })

  test('should work with unary expression', (assert) => {
    const statement = dedent`
    @unless(!age)
      <h2> Please type your age </h2>
    @endunless`

    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (!(!this.context.resolve('age'))) {
        out += \`  <h2> Please type your age </h2>\\n\`
      }
      return out
    }).bind(this)()
    `)
  })
})
