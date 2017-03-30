'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const EOL = require('../../lib/EOL')
const identString = require('indent-string')

/**
 * Buffer class is used to write compiled lines to
 * an array. Later this array can be used to
 * save a pre-compiled template.
 *
 * ### Note
 * Buffer has no idea on how a template is compiled, it is
 * just a store to keep compiled lines for any given
 * template.
 *
 * @class Buffer
 * @constructor
 */
class Buffer {
  /**
   * The buffer constructor
   *
   * @method constructor
   *
   * @param  {Boolean}   asFunction Compile template as a function
   *                                instead of `module.exports`
   */
  constructor (asFunction = false) {
    this._lines = []
    this._identation = 0
    this._asFunction = asFunction
    this._start()
  }

  /**
   * Starts the buffer by adding required lines
   * to the start.
   *
   * @method _start
   *
   * @private
   */
  _start () {
    this._asFunction
      ? this.writeLine('return (function templateFn () {')
      : this.writeLine('module.exports = function () {')

    this.indent()
    this.writeLine('let out = new String()')
  }

  /**
   * Returns an array of lines to be used for
   * marking the template buffer closed.
   *
   * @method _getEndLines
   *
   * @return {Array}
   *
   * @private
   */
  _getEndLines () {
    const output = [identString('return out', this._identation)]
    this._asFunction ? output.push('}).bind(this)()') : output.push('}')
    return output
  }

  /**
   * The EOL to be used for new lines
   *
   * @attribute EOL
   *
   * @return {String}
   */
  get EOL () {
    return EOL
  }

  /**
   * Ident the upcoming new lines by 2 spaces.
   *
   * @method indent
   *
   * @return {void}
   */
  indent () {
    this._identation += 2
  }

  /**
   * Dedent the output by 2 spaces, but
   * make sure to stop at 0.
   *
   * @method dedent
   *
   * @return {void}
   */
  dedent () {
    this._identation = this._identation < 2 ? 0 : this._identation - 2
  }

  /**
   * Writes a new line to the buffer.
   *
   * @method writeLine
   *
   * @param  {String}  line
   *
   * @return {void}
   */
  writeLine (line) {
    this._lines.push(identString(line, this._identation))
  }

  /**
   * Writes a new line to the output variable.
   *
   * @method writeToOutput
   *
   * @param  {String}      line
   *
   * @example
   * ```
   * buffer.writeLine('foo')
   * // says
   * // out += \`foo\n\`
   * ```
   *
   * @return {void}
   *
   * @chainable
   */
  writeToOutput (line, newLine = true) {
    line = newLine ? `${line}\\n` : line
    this.writeLine(`out += \`${line}\``)
    return this
  }

  /**
   * Writes multiple lines to the output
   *
   * @method writeMultiLineToOutput
   *
   * @param  {Array}               lines
   *
   * @return {void}
   *
   * @chainable
   */
  writeMultiLineToOutput (lines) {
    this.writeToOutput(lines.join('\\n'))
    return this
  }

  /**
   * Returns the lines in a buffer as a string wrapped
   * inside `module.exports` or `function` based upon
   * the `asFunction` property.
   *
   * @method getLines
   *
   * @return {String}
   */
  getLines () {
    const lines = this._lines.concat(this._getEndLines())
    return lines.join('\n')
  }

  /**
   * Adds a new line calling the rutime isolate function.
   * This is required when some piece of code needs
   * isolated instance.
   *
   * @method startIsolation
   *
   * @return {void}
   */
  startIsolation () {
    this.writeLine('this.isolate(function () {')
    this.indent()
  }

  /**
   * Ends the isolate method. Any values passed to this
   * method will be given to nexContext method.
   *
   * @method endIsolation
   *
   * @param  {Object}     props
   *
   * @return {void}
   */
  endIsolation (props) {
    this.dedent()
    const newContextFn = props ? `this.newContext(${props})` : 'this.newContext()'
    this.writeLine(`}.bind(${newContextFn}))`)
  }
}

module.exports = Buffer
