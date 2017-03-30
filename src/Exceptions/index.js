'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const NE = require('node-exceptions')
const _ = require('lodash')

/**
 * Exception class responsible for throwing invalid expression
 * exceptions.
 *
 * @class  InvalidExpressionException
 * @static
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
   * A generic expression with the ability to attach
   * lineno and charno to the error.
   *
   * @method generic
   *
   * @param  {String} message
   * @param  {Number} lineno
   * @param  {Number} charno
   *
   * @return {Object}
   */
  static generic (message, lineno, charno) {
    const error = new this(message, 500, 'E_INVALID_EXPRESSION')
    error.lineno = lineno
    error.charno = charno
    return error
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
   * @param  {Number}  charno
   *
   * @return {Object}
   */
  static invalidTagExpression (statement, tagName, lineno, charno) {
    const message = `Invalid expression <${statement}> passed to (${tagName}) block`
    const error = new this(message, 500, 'E_INVALID_EXPRESSION')
    error.lineno = lineno
    error.charno = charno
    return error
  }

  /**
   * Invalid expression passed inside `{{ }}`.
   *
   * @method invalidLineExpression
   *
   * @param  {String} statement
   * @param  {Number} lineno
   * @param  {Number} charno
   *
   * @return {Object}
   */
  static invalidLineExpression (statement, lineno, charno) {
    const error = new this(`Invalid expression <${statement}>`, 500, 'E_INVALID_EXPRESSION')
    error.lineno = lineno
    error.charno = charno
    return error
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
    const message = `Unclosed (${tagName}) tag found as <${statement}> statement. Make sure to close it as (end${tagName})`
    const error = new this(message, 500, 'E_UNCLOSED_TAG')
    error.lineno = lineno
    return error
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

  /**
   * This exception is thrown when argument is not valid
   *
   * @method invalidArgument
   *
   * @param  {String}        message
   *
   * @return {Object}
   */
  static invalidArgument (message) {
    return new this(message, 500, 'E_INVALID_ARGUMENT')
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

  /**
   * Exception is thrown when trying to make use of a presenter
   * and it does not exists on a given location.
   *
   * @method missingPresenter
   *
   * @param  {String}         presenterName
   * @param  {String}         location
   *
   * @return {Object}
   */
  static missingPresenter (presenterName, location) {
    const message = `Cannot load ${presenterName} Presenter. Make sure the file exists at ${location} location.`
    return new this(message, 500, 'E_MISSING_PRESENTER')
  }

  /**
   * Exception is thrown when trying to make use of a presenter
   * and the `presentersPath` has never been defined.
   *
   * @method unregisterdPresenters
   *
   * @param  {String}              presenterName
   *
   * @return {Object}
   */
  static unregisterdPresenters (presenterName) {
    const message = `Cannot load ${presenterName} Presenter. Make sure to register the presenters path first.`
    return new this(message, 500, 'E_MISSING_PRESENTER')
  }

  /**
   * Exception thrown when trying to render a view
   * and it does not exists on a given location.
   *
   * @method missingPresenter
   *
   * @param  {String}         viewName
   * @param  {String}         location
   *
   * @return {Object}
   */
  static missingView (viewName, location) {
    const message = `Cannot render ${viewName}. Make sure the file exists at ${location} location.`
    return new this(message, 500, 'E_MISSING_VIEW')
  }

  /**
   * Exception is thrown when trying to render a view
   * and the `viewsPath` has never been defined.
   *
   * @method unregisterdPresenters
   *
   * @param  {String}              viewName
   *
   * @return {Object}
   */
  static unregisteredViews (viewName) {
    const message = `Cannot render ${viewName}. Make sure to register the views path first.`
    return new this(message, 500, 'E_MISSING_VIEW')
  }
}

module.exports = {
  InvalidExpressionException,
  InvalidArgumentException,
  InvalidTemplateException,
  RuntimeException
}
