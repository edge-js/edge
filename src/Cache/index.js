'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

class Cache {
  constructor () {
    this._items = {}
  }

  /**
   * Add key value pair to the memory cache
   *
   * @method add
   *
   * @param  {String} location
   * @param  {String} output
   *
   * @return {void}
   */
  add (location, output) {
    this._items[location] = output
  }

  /**
   * Get value back from the cache
   *
   * @method get
   *
   * @param  {String} location
   *
   * @return {String}
   */
  get (location) {
    return this._items[location]
  }

  /**
   * Remove item from the cache
   *
   * @method remove
   *
   * @param  {String} location
   *
   * @return {void}
   */
  remove (location) {
    delete this._items[location]
  }
}

module.exports = new Cache()
