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
 * The official include tag. It is used
 * as `@include` inside templates.
 *
 * @class IncludeTag
 * @extends {BaseTag}
 * @static
 */
class IncludeTag extends BaseTag {
  /**
   * Tag name to be used for registering
   * the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'include'
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
    return false
  }

  /**
   * The expressions allowed inside an if tag.
   *
   * @method allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return ['Literal', 'Identifier', 'MemberExpression', 'CallExpression']
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
    const compiledStatement = this._compileStatement(lexer, body, lineno).toStatement()
    buffer.writeToOutput(`$\{${lexer.runTimeRenderFn}(${compiledStatement})}`, false)
  }

  /**
   * Nothing needs to be done in runtime
   * for an include tag
   */
  run () {
  }
}

module.exports = IncludeTag
