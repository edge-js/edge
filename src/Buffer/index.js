'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const os = require('os')
const identString = require('indent-string')

/**
 * Buffer class is used to write the compiled
 * template output. This is not the actual
 * buffer, but a simple class with array
 * to push new lines to.
 *
 * Also it will handle the opening and closing tags
 * for a compile function.
 *
 * @class Buffer
 * @constructor
 */
class Buffer {
  constructor (asFunction = false) {
    this._lines = []
    this._identation = 0
    /**
     * Export the template as function instead of
     * module.exports.
     */
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
   */
  writeToOutput (line) {
    this.writeLine(`out += \`${line}\\n\``)
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
    return lines.join(os.EOL)
  }
}

module.exports = Buffer
