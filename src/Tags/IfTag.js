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
 * The official if tag. It is used
 * as `@if` inside templates.
 *
 * @class IfTag
 * @extends {BaseTag}
 * @static
 */
class IfTag extends BaseTag {
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
   * The expressions allowed to be passed to the
   * tag. Any other expressions will cause an
   * error.
   *
   * @attribute allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return [
      'BinaryExpression',
      'Literal',
      'Identifier',
      'CallExpression',
      'MemberExpression',
      'UnaryExpression',
      'LogicalExpression'
    ]
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
     * Open if tag
     */
    buffer.writeLine(`if (${compiledStatement}) {`)
    buffer.indent()

    /**
     * Re-parse all childs via compiler.
     */
    childs.forEach((child) => compiler.parseLine(child))

    /**
     * Close the if tag
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

module.exports = IfTag
