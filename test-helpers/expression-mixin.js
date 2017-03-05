'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = function (test) {
  test('should have an original type', (assert) => {
    assert.isDefined(this.exp.originalType)
    assert.equal(this.exp.constructor.name, this.exp.originalType)
  })

  test('should have a type', (assert) => {
    assert.isDefined(this.exp._tokens.type)
    assert.equal(this.exp.type, this.exp._tokens.type)
  })
}
