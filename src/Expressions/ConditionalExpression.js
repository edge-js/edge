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
 * Conditional expression parses the shorthand if
 * statement.
 *
 * @class ConditionalExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```js
 * username ? username : 'anonymous'
 * ```
 *
 */
class ConditionalExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      members: [],
      test: null,
      consequent: null,
      alternate: null,
      wrapAlternate: false,
      type: 'conditional'
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
    this._tokens.test = this._lexer.parse(expression.test)
    this._tokens.consequent = this._lexer.parse(expression.consequent)
    this._tokens.alternate = this._lexer.parse(expression.alternate)
    this._tokens.wrapAlternate = expression.alternate.type === 'ConditionalExpression'
  }

  /**
   * Returns the formatted string for the alternate part
   * of the token
   *
   * @method testStatement
   *
   * @return {String}
   */
  testStatement () {
    return this._convertToStatement(this._tokens.test, true)
  }

  /**
   * Returns the formatted string for the alternate part
   * of the token
   *
   * @method consequentStatement
   *
   * @return {String}
   */
  consequentStatement () {
    return this._convertToStatement(this._tokens.consequent, true)
  }

  /**
   * Returns the formatted string for the alternate part
   * of the token
   *
   * @method alternateStatement
   *
   * @return {String}
   */
  alternateStatement () {
    const alternateStatement = this._convertToStatement(this._tokens.alternate, true)
    return this._tokens.wrapAlternate ? `(${alternateStatement})` : alternateStatement
  }

  /**
   * Converts tokens into parsed statement
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    return `${this.testStatement()} ? ${this.consequentStatement()} : ${this.alternateStatement()}`
  }
}

module.exports = ConditionalExpression
