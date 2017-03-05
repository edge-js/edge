'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NE = require('node-exceptions')
const _ = require('lodash')

/**
 * Exception class responsible for throwing invalid expression.
 *
 * @class  InvalidExpressionException
 */
class InvalidExpressionException extends NE.LogicalException {
  /**
   * This exception is thrown when someone try to pass an
   * expression to a tag that does not support it.
   * For example:
   *
   * ```
   * @if('username', 'age') {
   * }
   * // The above will throw exception since if condition
   * cannot parse it.
   * ```
   *
   * @method notAllowed
   *
   * @param  {Array}   allowed
   * @param  {String}  current
   * @param  {String}  term
   *
   * @return {Object}
   */
  static notAllowed (allowed, current, term) {
    term = _.size(allowed) === 1 ? term : `${term}s`
    const verb = _.size(allowed) === 1 ? 'is' : 'are'

    const message = `${allowed.join(', ')} ${verb} the only allowed ${term}, instead got ${current}. Report to the package author.`

    return new this(message.trim(), 500, 'E_EXPRESSION_NOT_ALLOWED')
  }

  /**
   * This exception is throw when invalid expression is passed
   * to a tag. This exception contains more context on which
   * line/tag and what expression was used.
   *
   * @method invalidTagExpression
   *
   * @param  {String}  statement
   * @param  {String}  tagName
   * @param  {Number}  lineno
   *
   * @return {Object}
   */
  static invalidTagExpression (statement, tagName, lineno) {
    const message = `lineno:${lineno} Invalid expression <${statement}> passed to (${tagName}) block.`
    return new this(message.trim(), 500, 'E_INVALID_EXPRESSION')
  }

  /**
   * Invalid expression passed inside `{{ }}`.
   *
   * @method invalidLineExpression
   *
   * @param  {String} statement
   * @param  {Number} lineno
   * @param  {Number} indexno
   *
   * @return {Object}
   */
  static invalidLineExpression (statement, lineno, indexno) {
    let message = `lineno:${lineno} `
    message += indexno && `char:${indexno} `
    message += `Invalid expression <${statement}>`
    return new this(message, 500, 'E_INVALID_EXPRESSION')
  }
}

/**
 * Exceptions thrown when unable to generate the AST
 * for the template
 *
 * @class InvalidTemplateException
 */
class InvalidTemplateException extends NE.LogicalException {

  /**
   * Exception thrown when unclosed block tags are
   * found in a template.
   *
   * ## For example
   * ```
   * @if(username)
   * // but never closed if
   * ```
   *
   * @method unClosedTag
   *
   * @param  {String}    tagName
   * @param  {String}    lineno
   * @param  {String}    statement
   *
   * @return {Object}
   */
  static unClosedTag (tagName, lineno, statement) {
    const message = `lineno:${lineno} Unclosed (${tagName}) tag found as <${statement}> statement. Make sure to close it as (end${tagName})`

    return new this(message, 500, 'E_UNCLOSED_TAG')
  }
}

/**
 * Exceptions thrown when invalid arguments are passed
 * around.
 *
 * @class InvalidArgumentException
 */
class InvalidArgumentException extends NE.InvalidArgumentException {
  /**
   * Exception thrown when unable to call a function
   * on a given expression.
   *
   * ## For Example
   * Trying to call a function on a object.
   *
   * ```
   * {name: 'virk'}.indexOf('virk')
   * ```
   *
   * @method cannotCallFunction
   *
   * @param  {String} expressionType
   *
   * @return {Object}
   */
  static cannotCallFunction (expressionType) {
    const message = `Cannot call function on ${expressionType} expression`
    return new this(message, 500, 'E_CANNOT_CALL_FN')
  }
}

/**
 * Runtime exceptions are thrown when something wrong
 * happens deep down and should always be reported
 * to the package author, since they can be handled
 * well.
 *
 * @class RunTimeException
 */
class RuntimeException extends NE.RuntimeException {
  /**
   * The expression is not parsable by esprima itself.
   *
   * @method cannotParse
   *
   * @param  {String}    errorMessage
   *
   * @return {Object}
   */
  static cannotParse (errorMessage) {
    const message = `${errorMessage} Report to the package author`
    return new this(message, 500, 'E_CANNOT_PARSE')
  }
}

module.exports = {
  InvalidExpressionException,
  InvalidArgumentException,
  InvalidTemplateException,
  RuntimeException
}
