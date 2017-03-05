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

class ArrayExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      members: [],
      type: 'array'
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
    this._tokens.members = expression.elements.map((element) => this._lexer.parse(element))
  }

  /**
   * Converts tokens back to an consumable
   * array string.
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    const tokens = this._tokens.members.map((member) => this._convertToStatement(member, true))
    return `[${tokens}]`
  }
}

module.exports = ArrayExpression
