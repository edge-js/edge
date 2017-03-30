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
 * The official unless tag. It is used
 * as `@unless` inside templates.
 *
 * @class UnlessTag
 * @extends {BaseTag}
 * @static
 */
class UnlessTag extends BaseTag {
  /**
   * The tag name to used for registering the tag
   *
   * @attribute tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'unless'
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
   * The expressions allowed to be passed to the
   * tag. Any other expressions will cause an
   * error.
   *
   * @attribute allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['BinaryExpression', 'Literal', 'Identifier', 'CallExpression', 'MemberExpression', 'UnaryExpression']
  }

  /**
   * Compile the template and write to the buffer.
   *
   * @method compile
   *
   * @param  {Object} compiler
   * @param  {Object} lexer
   * @param  {Object} buffer
   * @param  {String} options.body
   * @param  {Array} options.childs
   * @param  {Number} options.lineno
   *
   * @return {void}
   */
  compile (compiler, lexer, buffer, { body, childs, lineno }) {
    const compiledStatement = this._compileStatement(lexer, body, lineno).toStatement()

    /**
     * Open if opposite of tag
     */
    buffer.writeLine(`if (!(${compiledStatement})) {`)
    buffer.indent()

    /**
     * Re-parse all childs via compiler.
     */
    childs.forEach((child) => compiler.parseLine(child))

    /**
     * Close the opposite if tag
     */
    buffer.dedent()
    buffer.writeLine('}')
  }

  /**
   * Nothing needs to be in done in runtime for
   * an if tag.
   *
   * @method run
   */
  run () {
  }
}

module.exports = UnlessTag
