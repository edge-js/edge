'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/
const CE = require('../Exceptions')

/**
 * Base tag is extended by other tags and it has
 * not basic methods to be used to keep the code
 * DRY.
 *
 * @class BaseTag
 */
class BaseTag {
  /**
   * Compiles the statement to an expression object. It will
   * make use of the this.allowedExpressions property to
   * validate the expression against.
   *
   * @method _compileStatement
   *
   * @param  {Object}          lexer
   * @param  {String}          statement
   * @param  {Number}          lineno
   *
   * @return {Object}
   *
   * @private
   */
  _compileStatement (lexer, statement, lineno) {
    /**
     * Parse the statement to a compiled statement
     */
    try {
      return lexer.parseRaw(statement, this.allowedExpressions)
    } catch (error) {
      throw CE.InvalidExpressionException.invalidTagExpression(statement, this.tagName, lineno, '0')
    }
  }
}

module.exports = BaseTag
