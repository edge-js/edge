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
 * The official elseif tag. It is used
 * as `@elseif` inside templates.
 *
 * @class ElseIfTag
 * @extends {BaseTag}
 * @static
 */
class ElseIfTag extends BaseTag {
  /**
   * The tag name to used for registering the tag
   *
   * @attribute tagName
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
   * @attribute isBlock
   *
   * @return {Boolean}
   */
  get isBlock () {
    return false
  }

  /**
   * The expressions to be allowed to an elseif block
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

module.exports = ElseIfTag
