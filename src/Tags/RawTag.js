'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const BaseTag = require('./BaseTag')

/**
 * The raw tag for skipping the processing
 * of a line
 *
 * @class RawTag
 * @extends {BaseTag}
 * @static
 */
class RawTag extends BaseTag {
  /**
   * Tag name to be used for registering
   * the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'raw'
  }

  /**
   * Whether or not the tag is block level
   * tag. Which is no in this case.
   *
   * @method isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return true
  }

  /**
   * Process a line by returning the raw contents from
   * it. If line is a tag, process it's childs
   * recursively.
   *
   * @method _processLine
   *
   * @param  {Object}     line
   *
   * @return {String}
   */
  _processLine (line) {
    if (line.tag) {
      const output = [line.body]
      line.childs.forEach((child) => {
        output.push(this._processLine(child))
      })
      output.push(`@end${line.tag}`)
      return output.join('\n')
    }
    return line.body
  }

  /**
   * Compile the template
   *
   * @method compile
   *
   * @param  {Object} compiler
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array}  options.childs
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (compiler, lexer, buffer, { body, childs, lineno }) {
    childs.forEach((child) => buffer.writeToOutput(this._processLine(child)))
  }

  /**
   * Nothing needs to be done in runtime
   * for debugger tag
   */
  run () {
  }
}

module.exports = RawTag
