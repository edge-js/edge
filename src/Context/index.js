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
const debug = require('debug')('edge:context')
const escape = require('escape-html')

class Safe {
  constructor (input) {
    this._input = input
  }

  toString () {
    return this._input
  }
}

/**
 * Runtime context used to run the compiled
 * templates. View **locals**, **globals**,
 * and **presenter** all are accessible
 * from the context.
 *
 * Values are resolved in following order.
 *
 * 1. Frames
 * 2. Presenter
 * 3. Data/Locals
 * 4. Globals
 *
 * @class Context
 *
 * @constructor
 */
class Context {
  /**
   * The constructor for Context
   *
   * @method constructor
   *
   * @param  {String}    viewName
   * @param  {Object}    [presenter]
   * @param  {Object}    [globals]
   */
  constructor (viewName, presenter = {}, globals = {}) {
    debug('created context for %s view with %s presenter', viewName, presenter.constructor.name)
    this.$viewName = viewName
    this.$globals = globals
    this.$presenter = presenter
    this._frames = []
  }

  /**
   * Returns the frame for a given depth. The
   * depth is calculated from the right.
   *
   * @method _getFrame
   *
   * @param  {Number}  [depth=0]
   *
   * @return {Object}
   *
   * @private
   */
  _getFrame (depth = 0) {
    return _.nth(this._frames, -`${depth + 1}`)
  }

  /**
   * Parses a key from removing `$parent.`
   * from it and returns the depth of
   * parent accessor.
   *
   * @method _parseKey
   *
   * @param  {String}  key
   *
   * @return {Object}
   *
   * @private
   */
  _parseKey (key) {
    const keys = key.split('$parent')
    const filteredKeys = keys
      .filter((key) => key !== '' && key !== '.')
      .map((key) => key.replace(/^\./, ''))

    if (filteredKeys.length === 0) {
      return {
        depth: keys.length - 1,
        key: ''
      }
    }

    return {
      depth: keys.length - filteredKeys.length,
      key: filteredKeys.join('.')
    }
  }

  /**
   * Returns the value for a given key by resolving
   * it in the defined order.
   *
   * See class description for resolve order.
   *
   * @method _getValue
   *
   * @param  {Object}  frame
   * @param  {String}  key
   *
   * @return {Mixed} The output value for the key
   *
   * @private
   */
  _getValue (frame, key) {
    /**
     * Step 1: Look for value inside given frame
     */
    debug('resolving %s key inside frame %j', key, frame)
    let value = _.get(frame, key)

    /**
     * Step 2: Look for value inside the presenter
     * object.
     */
    if (value === undefined) {
      debug('resolving %s key on presenter', key)
      value = _.get(this.$presenter, key)
    }

    /**
     * Step 3: Look for value inside presenter
     * data object.
     */
    if (value === undefined) {
      debug('resolving %s key on presenter data', key)
      value = _.get(this.$presenter.$data, key)
    }

    /**
     * Step 4: Finally look for value inside globally.
     */
    if (value === undefined) {
      debug('resolving %s key on globals', key)
      value = _.get(this.$globals, key)
      value = typeof (value) === 'function' ? value.bind(this) : value
    }

    return value
  }

  /**
   * Pushes a new frame to the frames array.
   *
   * @method newFrame
   *
   * @return {void}
   */
  newFrame () {
    debug('adding new frame')
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
    debug('setting %s to %j on frame', key, value)
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
    debug('clearing the frame')
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
   *
   * @example
   * ```
   * const users = [{username: 'foo'}]
   * const username = accessChild(users, ['0', 'username'])
   * ```
   */
  accessChild (hash, childs, i = 1) {
    if (childs[0] === '$parent') {
      i++
      childs.shift()
      return this.accessChild(this._getFrame(i), childs, i)
    }
    return _.get(hash, childs)
  }

  safe (input) {
    return new Safe(input)
  }

  /**
   * Escapes the input by sanitizing HTML.
   *
   * @method escape
   *
   * @param  {String} input
   *
   * @return {String}
   */
  escape (input) {
    if (input instanceof Safe) {
      return input.toString()
    }
    return escape(input)
  }

  /**
   * Resolves a key in following order.
   *
   * 1. frame
   * 2. presenter
   * 3. presenter data/locals
   * 4. global
   *
   * @method resolve
   *
   * @param  {String} key
   *
   * @return {Mixed}
   */
  resolve (key) {
    if (key === '$parent') {
      return this._getFrame(1)
    }
    return this._getValue(this._getFrame(0), key) || ''
  }

  /**
   * Calls a function and pass the arguments. Also the
   * function scope will be changed to context scope.
   *
   * @method callFn
   *
   * @param  {String} name
   * @param  {Array} args
   *
   * @return {Mixed}
   */
  callFn (name, args) {
    const fn = this.resolve(name)
    if (typeof (fn) !== 'function') {
      throw new Error(`Cannot call function ${name} from ${this.$viewName} view`)
    }
    return fn.apply(this, args)
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
