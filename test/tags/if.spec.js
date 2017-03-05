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
const ifTag = require('../../src/Tags').ifTag
const elseIfTag = require('../../src/Tags').elseIfTag
const elseTag = require('../../src/Tags').elseTag
const Template = require('../../src/Template/compiler')
const dedent = require('dedent-js')

test.group('Tags | If ', (group) => {
  group.before(() => {
    this.tags = {
      if: {
        name: ifTag.tagName,
        isBlock: ifTag.isBlock,
        compile: ifTag.compile.bind(ifTag)
      },
      elseif: {
        name: elseIfTag.tagName,
        isBlock: elseIfTag.isBlock,
        compile: elseIfTag.compile.bind(ifTag)
      },
      else: {
        name: elseTag.tagName,
        isBlock: elseTag.isBlock,
        compile: elseTag.compile.bind(ifTag)
      }
    }
  })

  test('parse simple if block to compiled template', (assert) => {
    const statement = dedent`
      @if(username === 'virk')
        <p> Hello virk </p>
      @endif
    `
    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.resolve('username') === 'virk') {
      out += \`  <p> Hello virk </p>\`
    }`)
  })

  test('parse block with else', (assert) => {
    const statement = dedent `
    @if(username === 'virk')
      <p> Hello virk </p>
    @else
      <p> Hello anonymous </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.resolve('username') === 'virk') {
      out += \`  <p> Hello virk </p>\`
    } else {
      out += \`  <p> Hello anonymous </p>\`
    }`)
  })

  test('parse block with elseif', (assert) => {
    const statement = dedent `
    @if(username === 'virk')
      <p> Hello virk </p>
    @elseif(username === 'nikk')
      <p> Hey Nikk </p>
    @else
      <p> Hello anonymous </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.resolve('username') === 'virk') {
      out += \`  <p> Hello virk </p>\`
    } else if (this.resolve('username') === 'nikk') {
      out += \`  <p> Hey Nikk </p>\`
    } else {
      out += \`  <p> Hello anonymous </p>\`
    }`)
  })

  test('parse block with literal inside if', (assert) => {
    const statement = dedent`
    @if('virk')
      <p> Hello virk </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if ('virk') {
      out += \`  <p> Hello virk </p>\`
    }`)
  })

  test('parse block with identifier inside if', (assert) => {
    const statement = dedent`
    @if(username)
      <p> Hello {{ username }} </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.resolve('username')) {
      out += \`  <p> Hello \${this.escape(this.resolve('username'))} </p>\`
    }`)
  })

  test('parse block with arithmatic expression', (assert) => {
    const statement = dedent`
    @if(2 + 2)
      <p> It is {{ 2 + 2 }} </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (2 + 2) {
      out += \`  <p> It is \${this.escape(2 + 2)} </p>\`
    }`)
  })

  test('parse block with arithmatic and binary expression expression', (assert) => {
    const statement = dedent`
    @if(2 + 2 === cartTotal)
      <p> Hello {{ cartTotal }} </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (2 + 2 === this.resolve('cartTotal')) {
      out += \`  <p> Hello \${this.escape(this.resolve('cartTotal'))} </p>\`
    }`)
  })

  test('parse when a function has been passed', (assert) => {
    const statement = dedent`
    @if(count(users))
      <p> There are {{ count(users) }} </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.callFn('count', [this.resolve('users')])) {
      out += \`  <p> There are \${this.escape(this.callFn('count', [this.resolve('users')]))} </p>\`
    }`)
  })

  test('parse when a native function is called', (assert) => {
    const statement = dedent`
    @if(users.indexOf('virk') > -1)
      <p> Hello {{ users['virk'] }} </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.resolve('users').indexOf('virk') > -1) {
      out += \`  <p> Hello \${this.escape(this.accessChild(this.resolve('users'), ['virk']))} </p>\`
    }`)
  })

  test('parse when a property accessor is passed', (assert) => {
    const statement = dedent`
    @if(user.isLoggedIn)
      <p> Hello {{ user.username }} </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = template.compile(statement)
    assert.equal(output, dedent `
    let out = new String()
    if (this.accessChild(this.resolve('user'), ['isLoggedIn'])) {
      out += \`  <p> Hello \${this.escape(this.accessChild(this.resolve('user'), ['username']))} </p>\`
    }`)
  })

  test('throw exception when assignment expression is passed', (assert) => {
    const statement = dedent`
    @if(age = 22)
      <p> You are 22 years old </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = () => template.compile(statement)
    assert.throw(output, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 Invalid expression <age = 22> passed to (if) block.')
  })

  test('throw exception when sequence expression is passed', (assert) => {
    const statement = dedent`
    @if(age, username)
      <p> You are 22 years old </p>
    @endif`

    const template = new Template(this.tags, statement)
    const output = () => template.compile(statement)
    assert.throw(output, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 Invalid expression <age, username> passed to (if) block.')
  })
})
