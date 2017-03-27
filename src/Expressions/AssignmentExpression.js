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
   * Returns the key/value pair of assignment as an object
   * containing key and value. This method should be used
   * when you want to fetch values for individual keys
   * at compile time.
   *
   * For runtime you should consider using `this.toStatement()`
   *
   * @method toObject
   *
   * @return {Object}
   */
  toObject () {
    return {
      key: this._convertToStatement(this._tokens.lhs, false),
      value: this._convertToStatement(this._tokens.rhs, true)
    }
  }

  /**
   * Converts the expression into a string which looks like
   * an object, but is not an object. The `toStatement()`
   * should be used when you want to evaluate the object
   * at runtime.
   *
   * For compile time evaluation make use of `this.toObject()` instead.
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    const keyValue = this.toObject()
    return `{${keyValue.key}: ${keyValue.value}}`
  }
}

module.exports = AssignmentExpression
