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
 * Member expression parses an value accessors into tokens.
 *
 * @class MemberExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // following are the valid Member expressions
 * user.username
 * user[0].username
 * user[username]
 * ```
 */
class MemberExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      parent: null,
      members: [],
      type: 'object-member'
    }
  }

  _parseMember (member) {
    if (member.object.type === 'MemberExpression') {
      this._parseMember(member.object)
    } else {
      this._tokens.parent = this._lexer.parse(member.object)
    }

    this._tokens.members.push({
      value: this._lexer.parse(member.property),
      computed: member.computed
    })
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
    this._parseMember(expression)
  }

  /**
   * Converts the parent member to statement. This method
   * is also used by call expression.
   *
   * @method parentToStatement
   *
   * @return {String}
   */
  parentToStatement () {
    return this._convertToStatement(this._tokens.parent, true)
  }

  /**
   * Returns the child members. The method is also used
   * by call expression
   *
   * @method getMembers
   *
   * @return {Array}
   */
  getMembers () {
    return this._tokens.members
  }

  /**
   * Converts a single child member to statement. The method is
   * also used by call expression.
   *
   * @method memberToStatement
   *
   * @param  {Object}          member
   *
   * @return {String}
   */
  memberToStatement (member) {
    const statement = this._convertToStatement(member.value, member.computed)
    return member.value.type === 'source' && !member.computed ? `'${statement}'` : statement
  }

  /**
   * Converts tokens to parsed statement
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    const parent = this.parentToStatement()
    const members = this._tokens.members
    return `${this._lexer.accessFn}(${parent}, [${members.map(this.memberToStatement.bind(this))}])`
  }
}

module.exports = MemberExpression
