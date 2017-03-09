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
 * The official elseif tag. It is used
 * as `@elseif` inside templates.
 *
 * @class ElseIfTag
 */
class ElseIfTag {
  get allowedExpressions () {
    return ['BinaryExpression', 'Literal', 'Identifier', 'CallExpression', 'MemberExpression']
  }

  /**
   * The tag name to used for registering the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'elseif'
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
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (parser, lexer, buffer, { body, childs, lineno }) {
    /**
     * Parse the statement to a compiled statement
     */
    const compiledStatement = lexer.parseRaw(body, this.allowedExpressions).toStatement()

    /**
     * Write to buffer.
     */
    buffer.dedent()
    buffer.writeLine(`} else if (${compiledStatement}) {`)
    buffer.indent()
  }

  /**
   * Nothing needs to be in done in runtime for
   * an elseif tag.
   *
   * @method run
   */
  run () {
  }
}

module.exports = new ElseIfTag()
