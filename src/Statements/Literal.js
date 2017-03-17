'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const upcast = require('upcast')

module.exports = function (expression) {
  return {
    value: expression.value,
    type: upcast.type(expression.value),
    originalType: expression.type,
    toStatement () {
      return this.type === 'string' ? `'${this.value}'` : this.value
    }
  }
}
