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

class ObjectExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      members: [],
      type: 'object'
    }
  }

  /**
   * Returns the formatted key for the
   * object.
   *
   * @method _getKey
   *
   * @param  {Object} member
   *
   * @return {String}
   */
  _getKey (member) {
    const isRefrencedKey = member.computed && !member.shorthand
    return isRefrencedKey ? `[${this._convertToStatement(member.name, true)}]` : this._convertToStatement(member.name)
  }

  /**
   * Returns the formatted value for the object
   *
   * @method _getValue
   *
   * @param  {Object}  member
   *
   * @return {String}
   */
  _getValue (member) {
    return this._convertToStatement(member.value, true)
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
    this._tokens.members = expression.properties.map((property) => {
      return {
        name: this._lexer.parseStatement(property.key),
        computed: property.computed,
        shorthand: property.shorthand,
        value: this._lexer.parse(property.value)
      }
    })
  }

  /**
   * Converts tokens into parsed statement
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    const convertedMembers = this._tokens.members.map((member) => `${this._getKey(member)}: ${this._getValue(member)}`)
    return `{${convertedMembers}}`
  }
}

module.exports = ObjectExpression
