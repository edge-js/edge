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
 * Assigment expression parses the assignment into
 * tokens.
 *
 * @class AssignmentExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // the following is a valid assignment expression.
 * username = 'virk'
 * ```
 */
class AssignmentExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      operator: '=',
      lhs: null,
      rhs: null,
      type: 'assignment'
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
    this._tokens.lhs = this._lexer.parse(expression.left)
    this._tokens.rhs = this._lexer.parse(expression.right)
  }

  /**
   * Converts an assignment to an object
   * string.
   *
   * @method toObject
   *
   * @return {String}
   */
  toObject () {
    return `{${this._convertToStatement(this._tokens.lhs, false)}: ${this._convertToStatement(this._tokens.rhs, true)}}`
  }
}

module.exports = AssignmentExpression
