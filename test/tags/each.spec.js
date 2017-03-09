'use strict'

const test = require('japa')
const eachTag = require('../../src/Tags').eachTag
const Template = require('../../src/Template/compiler')
const dedent = require('dedent-js')

test.group('Tags | If ', (group) => {
  group.before(() => {
    this.tags = {
      each: {
        name: eachTag.tagName,
        isBlock: eachTag.isBlock,
        compile: eachTag.compile.bind(eachTag)
      }
    }
  })

  test('parse simple each block to compiled template', (assert) => {
    const statement = dedent`
    @each(user in users)
    @endeach
    `
    const template = new Template(this.tags, statement)
    const output = template.compile(statement)

    assert.equal(output, dedent `
    module.exports = function () {
      let out = new String()
      this.newFrame()
      this.loop(this.resolve('users'), (user, loop) => {
        this.setOnFrame('user', user)
        this.setOnFrame('$loop', loop)
      })
      this.clearFrame()
      return out
    }`)
  })

  test('parse each block with content to compiled template', (assert) => {
    const statement = dedent`
    @each(user in users)
      <p> Hello {{ user.username }} </p>
    @endeach
    `
    const template = new Template(this.tags, statement)
    const output = template.compile(statement)

    assert.equal(output, dedent `
    module.exports = function () {
      let out = new String()
      this.newFrame()
      this.loop(this.resolve('users'), (user, loop) => {
        this.setOnFrame('user', user)
        this.setOnFrame('$loop', loop)
        out += \`  <p> Hello \${this.escape(this.accessChild(this.resolve('user'), ['username']))} </p>\\n\`
      })
      this.clearFrame()
      return out
    }`)
  })

  test('parse nested each blocks', (assert) => {
    const statement = dedent`
    @each(user in users)
      @each(profile in user.profiles)
        <p> Hello {{ user.username }} </p>
      @endeach
    @endeach
    `
    const template = new Template(this.tags, statement)
    const output = template.compile(statement).split('\n')
    assert.equal(output[3].trim(), `this.loop(this.resolve('users'), (user, loop) => {`)
    assert.equal(output[7].trim(), `this.loop(this.accessChild(this.resolve('user'), ['profiles']), (profile, loop) => {`)
  })

  test('throw exception when expression is not binary', (assert) => {
    const statement = dedent`
    @each(user, users)
    @endeach
    `
    const template = new Template(this.tags, statement)
    const output = () => template.compile(statement)
    assert.throw(output, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 Invalid expression <user, users> passed to (each) block.')
  })

  test('throw exception when expression operator is not {in}', (assert) => {
    const statement = dedent`
    @each(user == users)
    @endeach
    `
    const template = new Template(this.tags, statement)
    const output = () => template.compile(statement)
    assert.throw(output, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 Invalid expression <user == users> passed to (each) block.')
  })

  test('throw exception when expression operator is not parsable', (assert) => {
    const statement = dedent`
    @each(user of users)
    @endeach
    `
    const template = new Template(this.tags, statement)
    const output = () => template.compile(statement)
    assert.throw(output, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 Invalid expression <user of users> passed to (each) block.')
  })
})
