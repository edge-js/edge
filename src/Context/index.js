'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

class Context {
  constructor (data, globals) {
    this._data = data
    this._globals = globals
    this._frames = []
  }

  /**
   * Returns the frame for a given depth. The
   * depth is calculated from the right.
   *
   * @method _getFrame
   *
   * @param  {Number}  depth
   *
   * @return {Mixed}
   */
  _getFrame (depth) {
    return _.nth(this._frames, -`${depth+1}`)
  }

  /**
   * Parses a key from removing `parent.`
   * from it and returns the depth of
   * parent accessor.
   *
   * @method _parseKey
   *
   * @param  {String}  key
   *
   * @return {Object}
   */
  _parseKey (key) {
    const keys = key.split('parent.')
    const filteredKeys = keys.filter((key) => key !== '')
    return {
      depth: keys.length - filteredKeys.length,
      key: filteredKeys.join('.')
    }
  }

  _getValue (frame, key) {
    return _.get(frame, key, _.get(this._data, key, _.get(this._globals, key)))
  }

  /**
   * Pushes a new frame to the frames array.
   *
   * @method newFrame
   *
   * @return {void}
   */
  newFrame () {
    this._frames.push({})
  }

  /**
   * Sets the value on the most recent frame.
   *
   * @method setOnFrame
   *
   * @param  {String}   key
   * @param  {Mixed}   value
   *
   * @throws {Exception} If trying to set value without calling the `newFrame` method.
   */
  setOnFrame (key, value) {
    const activeFrame = _.last(this._frames)
    if (!activeFrame) {
      throw new Error(`Trying to set value ${value} on undefined frame. Make sure to call (newFrame) first.`)
    }
    activeFrame[key] = value
  }

  /**
   * Clears the most recent frame.
   *
   * @method clearFrame
   *
   * @return {void}
   */
  clearFrame () {
    this._frames = _.dropRight(this._frames)
  }

  /**
   * Access a child from the hash
   *
   * @method accessChild
   *
   * @param  {Array|Object}    hash
   * @param  {Array}    childs
   *
   * @return {Mixed}
   */
  accessChild (hash, childs) {
    return _.get(hash, childs)
  }

  /**
   * Escapes the input by sanitizing HTML
   *
   * @method escape
   *
   * @param  {String} input
   *
   * @return {String}
   */
  escape (input) {
    return input
  }

  /**
   * Resolves a key in following order.
   *
   * 1. frame
   * 2. local
   * 3. global
   *
   * @method resolve
   *
   * @param  {String} key
   *
   * @return {Mixed}
   */
  resolve (key) {
    const parsedKey = this._parseKey(key)
    const frame = this._getFrame(parsedKey.depth)
    return this._getValue(frame, parsedKey.key) || ''
  }

  /**
   * Calls a function and pass the arguments
   *
   * @method callFn
   *
   * @param  {String} name
   * @param  {Array} args
   *
   * @return {Mixed}
   */
  callFn (name, args) {
    const parsedKey = this._parseKey(name)
    const frame = this._getFrame(parsedKey.depth)
    const fn = this.resolve(parsedKey.key)
    return fn.apply(null, args)
  }

  /**
   * Add a macro to the context.
   *
   * @method macro
   *
   * @param  {String}   name
   * @param  {Function} fn
   */
  static macro (name, fn) {
    this.prototype[name] = fn
  }
}

module.exports = Context
