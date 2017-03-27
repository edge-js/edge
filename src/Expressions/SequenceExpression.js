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
 * Sequence expression parses a sequence statement seperated
 * by (comma) into tokens.
 *
 * @class SequenceExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // following are the valid Sequence expressions
 * user, age, email
 * ```
 *
 */
class SequenceExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      members: [],
      type: 'sequence'
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
    this._tokens.members = expression.expressions.map((exp) => this._lexer.parse(exp))
  }

  /**
   * Converts tokens into a parsed statement. All the
   * members `toObject` method is given preference
   * over `toStatement` method.
   *
   * @method toObject
   *
   * @return {Array}
   */
  toObject () {
    return this._tokens.members.map((member) => {
      return member.toObject ? member.toObject() : member.toStatement()
    })
  }

  /**
   * Converts tokens into a parsed statement. All the
   * members `toStatement` method is given preference
   * over `toObject` method.
   *
   * @method toStatement
   *
   * @return {Array}
   */
  toStatement () {
    return this._tokens.members.map((member) => {
      return member.toStatement ? member.toStatement() : member.toObject()
    })
  }
}

module.exports = SequenceExpression
