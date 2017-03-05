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
const Buffer = require('../src/Buffer')

test.group('Buffer', () => {
  test('write a new line', (assert) => {
    const buffer = new Buffer()
    buffer.writeLine('hello')
    assert.deepEqual(buffer._lines, [
      'module.exports = function () {',
      '  let out = new String()',
      '  hello'
    ])
  })

  test('write a new line to the output', (assert) => {
    const buffer = new Buffer()
    buffer.writeToOutput('hello')
    assert.deepEqual(buffer._lines, [
      'module.exports = function () {',
      '  let out = new String()',
      `  out += \`hello\``
    ])
  })

  test('write a new line with indentation', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.writeToOutput('hello')
    assert.deepEqual(buffer._lines, [
      'module.exports = function () {',
      '  let out = new String()',
      `    out += \`hello\``
    ])
  })

  test('write a new line with multiple indentation', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.indent()
    buffer.writeToOutput('hello')
    assert.deepEqual(buffer._lines, [
      'module.exports = function () {',
      '  let out = new String()',
      `      out += \`hello\``
    ])
  })

  test('dedent the above identation', (assert) => {
    const buffer = new Buffer()
    buffer.indent()
    buffer.dedent()
    buffer.writeToOutput('hello')
    assert.deepEqual(buffer._lines, [
      'module.exports = function () {',
      '  let out = new String()',
      `  out += \`hello\``
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
})
