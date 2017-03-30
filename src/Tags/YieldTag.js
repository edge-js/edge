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

class YieldTag extends BaseTag {
  /**
   * Tag name to be used for registering
   * the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'yield'
  }

  /**
   * Whether or not the tag is block level
   * tag. Which is yes in this case.
   *
   * @method isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return true
  }

  /**
   * Compiles the yield body
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
    const parsedStatement = lexer.parseRaw(body).toStatement()

    /**
     * If there is no fallback content, just write it
     */
    if (!childs.length) {
      buffer.writeToOutput(`$\{${parsedStatement}}`)
      return
    }

    /**
     * Otherwise wrap the value inside an if clause and
     * output the fallback content when actual value
     * does not exists.
     */
    buffer.writeLine(`if (${parsedStatement}) {`)
    buffer.indent()
    buffer.writeToOutput(`$\{${parsedStatement}}`)
    buffer.dedent()

    /**
     * Else statement for fallback content
     */
    buffer.writeLine('} else {')
    buffer.indent()
    childs.forEach((child) => parser.parseLine(child))
    buffer.dedent()
    buffer.writeLine('}')
  }

  /**
   * Does not need anything special at runtime
   *
   * @method run
   */
  run () {
  }
}

module.exports = YieldTag
