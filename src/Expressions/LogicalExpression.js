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
 * Logical expression parses a logical expression
 * into tokens.
 *
 * @class LogicalExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // following are the valid logical expressions
 * username || 'virk'
 * (username && email) || sessionToken
 * ```
 */
class LogicalExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      operator: null,
      lhs: null,
      rhs: null,
      wrapLhs: false,
      wrapRhs: false,
      type: 'logical'
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
    this._tokens.lhs = this._lexer.parse(expression.left)
    this._tokens.rhs = this._lexer.parse(expression.right)
    this._tokens.wrapLhs = expression.left.type === 'LogicalExpression'
    this._tokens.wrapRhs = expression.right.type === 'LogicalExpression'
  }

  /**
   * Convert the lhs expression to a statement
   *
   * @method lhsStatement
   *
   * @return {String}
   */
  lhsStatement () {
    let lhs = this._convertToStatement(this._tokens.lhs, true)
    if (this._tokens.wrapLhs) {
      lhs = `(${lhs})`
    }
    return lhs
  }

  /**
   * Converts the rhs expression to a statement.
   *
   * @method rhsStatement
   *
   * @return {String}
   */
  rhsStatement () {
    let rhs = this._convertToStatement(this._tokens.rhs, true)
    if (this._tokens.wrapRhs) {
      rhs = `(${rhs})`
    }
    return rhs
  }

  /**
   * Convers the expression to parsed statement
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    return `${this.lhsStatement()} ${this._tokens.operator} ${this.rhsStatement()}`
  }
}

module.exports = LogicalExpression
