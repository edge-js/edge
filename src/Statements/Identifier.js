'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = function (expression) {
  return {
    value: expression.name,
    type: 'source',
    originalType: expression.type,
    toStatement (unWrapSource) {
      return unWrapSource ? this.value : `this.context.resolve('${this.value}')`
    }
  }
}
