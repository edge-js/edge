'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const BaseExpression = require('./BaseExpression')

/**
 * Unary expression parses *unary* statement into tokens.
 *
 * @class UnaryExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // following are the valid Sequence expressions
 * !username
 * !!username
 * ```
 *
 */
class UnaryExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      operator: null,
      arg: null,
      type: 'unary'
    }
  }

  /**
   * Parses the expression. It is responsibility of the
   * consumer to pass the right expression otherwise
   * things will blow.
   *
   * @method parse
   *
   * @param  {Object} expression
   *
   * @return {void}
   */
  parse (expression) {
    this._tokens.operator = expression.operator
    this._tokens.arg = this._lexer.parse(expression.argument)
  }

  /**
   * Converts tokens into parsed statement
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    return `${this.tokens.operator}${this._convertToStatement(this._tokens.arg, true)}`
  }
}

module.exports = UnaryExpression
