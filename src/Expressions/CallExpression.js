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
const CE = require('../Exceptions')

/**
 * Call expression parses the a function call
 * into tokens. Also it gracefully handles
 * the raw functions and functions called
 * via prototype.
 *
 * @class CallExpression
 * @extends {BaseExpression}
 * @constructor
 *
 * @example
 * ```
 * // raw functions
 * count(users)
 *
 * // prototype functions
 * ['virk', 'nikk'].indexOf('nikk')
 * 'virk'.includes('v')
 * ```
 */
class CallExpression extends BaseExpression {
  constructor (lexer) {
    super(lexer)
    this._tokens = {
      callee: null,
      isCalleeAnExpression: false,
      args: [],
      type: 'call'
    }
  }

  /**
   * Parses an expression into tokens. The consumer
   * should be responsible for passing right
   * expression
   *
   * @method parse
   *
   * @param  {Object} expression
   *
   * @return {void}
   */
  parse (expression) {
    if (this._lexer.isExpression(expression.callee.type) && expression.callee.type !== 'MemberExpression') {
      throw CE.InvalidArgumentException.cannotCallFunction(expression.callee.type)
    }

    this._tokens.callee = this._lexer.parse(expression.callee)
    this._tokens.args = expression.arguments.map((arg) => this._lexer.parse(arg))
    this._tokens.isCalleeAnExpression = this._lexer.isExpression(expression.callee.type)
  }

  /**
   * Converts tokens back to parsed statement
   *
   * @method toStatement
   *
   * @return {String}
   */
  toStatement () {
    const args = this._tokens.args.map((arg) => this._convertToStatement(arg, true))
    const callee = this._tokens.callee

    /**
     * We always hit this block when callee is a member
     * expression.
     */
    if (this._tokens.isCalleeAnExpression) {
      /**
       * Fetch all members
       */
      const members = callee.getMembers()

      /**
       * Consider the last member to be the actual
       * function that exists on the prototype.
       *
       * @example
       * ```
       *   users.indexOf('user')
       *   user.includes('character')
       *   'virk'.includes('v')
       *   users.profiles.indexOf('public')
       * ```
       */
      const lastMember = members.pop()

      /**
       * Once we have the last member, we need to convert
       * it into a callable string and pass all arguments
       * as parameters.
       */
      const fn = `${this._convertToStatement(lastMember.value, false)}(${args.join(',')})`

      /**
       * Convert the parent member of the members expression
       * to a statement.
       */
      const parentToStatement = callee.parentToStatement()

      /**
       * If there are no child members on the members
       * expression, we should call the function on
       * the parent expression.
       */
      if (!members.length) {
        return `${parentToStatement}.${fn}`
      }

      /**
       * When member expression has child members, we need to
       * access the child before we can call the function on
       * it.
       *
       * @example
       * ```
       *   users.lists.indexOf('virk')
       *   // should first access `lists` inside `users` and call the
       *   // indexOf method on list
       * ```
       */
      const membersToStatement = members.map(callee.memberToStatement.bind(callee))
      return `${this._lexer.accessFn}(${parentToStatement}, [${membersToStatement}]).${fn}`
    }

    /**
     * Life is easier here, since the function itself
     * is referenced from the context.
     *
     * @example
     * ```
     *   count(users)
     *   onlyActive(users)
     * ```
     */
    return `${this._lexer.callFn}('${this._convertToStatement(callee, false)}', [${args}])`
  }
}

module.exports = CallExpression
