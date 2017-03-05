'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

class IfTag {
  get allowedExpressions () {
    return ['BinaryExpression', 'Literal', 'Identifier', 'CallExpression', 'MemberExpression']
  }

  /**
   * The tag name to used for registering the tag
   *
   * @attribute tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'if'
  }

  /**
   * Whether tag is a block level tag or
   * not.
   *
   * @attribute isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return true
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
     * Open if tag
     */
    buffer.writeLine(`if (${compiledStatement}) {`)
    buffer.indent()

    /**
     * Re-parse all childs via parser.
     */
    childs.forEach(parser.parseLine.bind(parser))

    /**
     * Close the if tag
     */
    buffer.dedent()
    buffer.writeLine('}')
  }

  /**
   * Method to be called on runtime.
   *
   * @method run
   */
  run () {
  }
}

module.exports = new IfTag()
