'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * The official else tag. It is used
 * as `@else` inside templates.
 *
 * @class ElseTag
 */
class ElseTag {
  /**
   * The tag name to used for registering the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'else'
  }

  /**
   * Whether tag is a block level tag or
   * not.
   *
   * @method isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return false
  }

  /**
   * Compile the template and write to the buffer.
   *
   * @method compile
   *
   * @param  {Object} parser
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array} options.childs
   * @param  {Number} options.lineNumber
   *
   * @return {void}
   */
  compile (parser, lexer, buffer) {
    /**
     * Write to buffer.
     */
    buffer.dedent()
    buffer.writeLine('} else {')
    buffer.indent()
  }

  /**
   * Nothing needs to be in done in runtime for
   * an else tag.
   *
   * @method run
   */
  run () {
  }
}

module.exports = new ElseTag()
