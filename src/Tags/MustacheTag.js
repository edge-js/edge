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
 * The mustache tag is used to write mustache syntax
 * in multiple lines.
 *
 * @class MustacheTag
 * @extends {BaseTag}
 * @static
 */
class MustacheTag extends BaseTag {
  /**
   * Tag name to be used for registering
   * the tag
   *
   * @method tagName
   *
   * @return {String}
   */
  get tagName () {
    return 'mustache'
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
   * The expressions allowed inside mustache tag. We want
   * to allow all expressions inside mustache tag.
   *
   * @method allowedExpressions
   *
   * @return {Array}
   */
  get allowedExpressions () {
    return []
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
    let isSafe = Array.isArray(compiledStatement) && compiledStatement[1]

    if (isSafe) {
      buffer.writeToOutput(`$\{${compiledStatement[0]}}`, false)
    } else {
      buffer.writeToOutput(`$\{${lexer.escapeFn}(${compiledStatement})}`, false)
    }
  }

  /**
   * Nothing needs to be done in runtime
   * for mustache tag
   */
  run () {
  }
}

module.exports = MustacheTag
