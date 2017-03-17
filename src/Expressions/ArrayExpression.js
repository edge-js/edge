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
 * Array expression parses the javascript array
 * into tokens.
 *
 * @class ArrayExpression
 * @extends {BaseExpression}
 * @constructor
 */
class ArrayExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      members: [],
      type: 'array'
    }
  }

  /**
   * Parses the esprima expression. It is responsibility of the
   * consumer to pass the right expression otherwise things
   * will blow.
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
   * Converts parsed tokens back to
   * consumable statement.
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
