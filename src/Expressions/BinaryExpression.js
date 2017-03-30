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
 * Binary expression parses the binary expression
 * into tokens.
 *
 * @class BinaryExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // following the valid binary expressions
 * username === 'virk'
 * username !== 'virk'
 * 2 * 2 === 4
 * ```
 */
class BinaryExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)

    this._tokens = {
      type: 'binary',
      lhs: null,
      wrapLhs: false,
      wrapRhs: false,
      rhs: null,
      operator: null
    }
  }

  /**
   * Returns whether an operator is arithmetic or not.
   *
   * @method _isArithmeticOperator
   *
   * @param  {String}              operator
   *
   * @return {Boolean}
   *
   * @private
   */
  _isArithmeticOperator (operator) {
    return ['+', '-', '/', '%', '*'].indexOf(operator) > -1
  }

  /**
   * Returns a boolean on whether a expression should be
   * wrapped inside `()` or not.
   *
   * @method _needsWrap
   *
   * @param  {String}   type
   * @param  {String}   operator
   *
   * @return {Boolean}
   *
   * @private
   */
  _needsWrap (type, operator) {
    return type === 'BinaryExpression' && this._isArithmeticOperator(operator)
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

    this._tokens.wrapLhs = this._needsWrap(expression.left.type, expression.operator)
    this._tokens.wrapRhs = this._needsWrap(expression.right.type, expression.operator)
  }

  /**
   * Convert the lhs expression to a statement
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
   * Converts the rhs expression to a statement
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
   * Returns a statement as `lhs <operator> rhs`
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    return `${this.lhsStatement()} ${this._tokens.operator} ${this.rhsStatement()}`
  }
}

module.exports = BinaryExpression
