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
const debug = require('debug')('edge')
const identString = require('indent-string')

/**
 * Buffer class is used to write the compiled
 * template output. This is not the actual
 * buffer, but a simple class with array
 * to push new lines to.
 *
 * @class Buffer
 */
class Buffer {
  constructor () {
    this._lines = []
    this._identation = 0
    this._start()
  }

  /**
   * Starts the buffer by adding required lines
   * to the start of the compiled template
   *
   * @method _start
   *
   * @private
   */
  _start () {
    this.writeLine('module.exports = function () {')
    this.indent()
    this.writeLine('let out = new String()')
  }

  /**
   * Ends the buffer by adding required line
   * to the end of the compiled template.
   *
   * @method _end
   *
   * @private
   */
  _end () {
    this.writeLine('return out')
    this.dedent()
    this.writeLine('}')
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
   * Writes a line to the buffer.
   *
   * @method writeLine
   *
   * @param  {String}  line
   *
   * @chainable
   */
  writeLine(line) {
    debug('writing following line to the buffer \n %s', line)
    this._lines.push(identString(line, this._identation))
    return this
  }

  /**
   * Write a new line as if you are appending
   * to the output variable.
   *
   * @method writeToOutput
   *
   * @param  {String}      line
   *
   * @example
   * ```
   * buffer.writeLine('foo')
   * // says
   * // out += 'foo'
   * ```
   *
   * @chainable
   */
  writeToOutput (line) {
    this.writeLine(`out += \`${line}\\n\``)
    return this
  }

  /**
   * Returns the lines in a buffer as a
   * string.
   *
   * @method getLines
   *
   * @return {String}
   */
  getLines () {
    this._end()
    return this._lines.join(os.EOL)
  }
}

module.exports = Buffer
