'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const BaseExpression = require('./BaseExpression')

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
   * Converts tokens into parsed statement
   *
   * @method toObject
   *
   * @return {Array}
   */
  toObject () {
    return this._tokens.members.map((member) => {
      return member.toStatement ? member.toStatement() : member.toObject()
    })
  }
}

module.exports = SequenceExpression
