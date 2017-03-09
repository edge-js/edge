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
const dedent = require('dedent-js')
const Buffer = require('../src/Buffer')
const trimLines = (lines) => lines.map((line) => line.trim())

test.group('Buffer', (group) => {
  test('write a new line', (assert) => {
    const buffer = new Buffer()
    buffer.writeLine('hello')
    assert.deepEqual(trimLines(buffer._lines), [
      'module.exports = function () {',
      'let out = new String()',
      'hello'
    ])
  })

  test('write a new line to the output', (assert) => {
    const buffer = new Buffer()
    buffer.writeToOutput('hello')
    assert.deepEqual(trimLines(buffer._lines), [
      'module.exports = function () {',
      'let out = new String()',
      `out += \`hello\\n\``
    ])
  })

  test('write a new line with indentation', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.writeToOutput('hello')
    assert.deepEqual(trimLines(buffer._lines), [
      'module.exports = function () {',
      'let out = new String()',
      `out += \`hello\\n\``
    ])
  })

  test('write a new line with multiple indentation', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.indent()
    buffer.writeToOutput('hello')
    assert.deepEqual(trimLines(buffer._lines), [
      'module.exports = function () {',
      'let out = new String()',
      `out += \`hello\\n\``
    ])
  })

  test('dedent the above identation', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.dedent()
    buffer.writeToOutput('hello')
    assert.deepEqual(trimLines(buffer._lines), [
      'module.exports = function () {',
      'let out = new String()',
      `out += \`hello\\n\``
    ])
  })

  test('min value should be zero when dedent is called multiple times', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.dedent()
    buffer.dedent()
    buffer.dedent()
    assert.equal(buffer._identation, 0)
  })

  test('return final output by closing the module.exports', (assert) => {
    const buffer = new Buffer()
    buffer.writeLine('foo')
    assert.equal(buffer.getLines(), dedent`
      module.exports = function () {
        let out = new String()
        foo
        return out
      }
    `)
  })

  test('output must remain same when calling getLines multiple times', (assert) => {
    const buffer = new Buffer()
    buffer.writeLine('foo')
    assert.equal(buffer.getLines(), buffer.getLines())
  })

  test('return as a function when asFunction is set to true', (assert) => {
    const buffer = new Buffer(true)
    buffer.writeLine('foo')
    assert.equal(buffer.getLines(), dedent`
      return (function templateFn () {
        let out = new String()
        foo
        return out
      }).bind(this)()`)
  })

  test('iife function should bound to this', (assert) => {
    class Context {
      run () {}
    }
    const buffer = new Buffer(true)
    buffer.writeLine('this.run()')
    /*eslint no-new-func: "ignore"*/
    const fn = new Function(buffer.getLines())
    fn.bind(new Context())()
  })

  test('return the out from iife', (assert) => {
    const buffer = new Buffer(true)
    buffer.writeToOutput('virk')
    const fn = new Function(buffer.getLines())
    const output = fn.bind({})()
    assert.equal(output.trim(), 'virk')
  })
})
