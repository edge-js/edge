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
 * Object expression parses a javascript object
 * into tokens.
 *
 * @class ObjectExpression
 * @extends {BaseExpression}
 * @constructor
 *
 */
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
   *
   * @private
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
   *
   * @private
   */
  _getValue (member) {
    return member.value.type === 'object' ? member.value.toObject() : this._convertToStatement(member.value, true)
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
   * Returns the key/value pair of an object as an array
   * containing objects with key and value. This method
   * should be used when you want to fetch values for
   * individual keys at compile time.
   *
   * For runtime you should consider using `this.toStatement()`
   *
   * @method toObject
   *
   * @return {Array}
   */
  toObject () {
    return this._tokens.members.map((member) => {
      return {
        key: this._getKey(member),
        value: this._getValue(member)
      }
    })
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
    const keyValue = this._tokens.members.map((member) => {
      return `${this._getKey(member)}: ${this._convertToStatement(member.value, true)}`
    })
    return `{${keyValue}}`
  }
}

module.exports = ObjectExpression
