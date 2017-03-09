'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const Renderer = require('./Renderer')
const Context = require('../Context')
const ExistingTags = require('../Tags')

/**
 * A public interface to render, compile views
 * in realtime.
 *
 * @class Edge
 */
class Edge {
  constructor () {
    this._tags = {}
    this._globals = {}
    this._viewsPath = null
    this._presentersPath = null
    this._boot()
  }

  /**
   * Does the initial setup. Needs to be done
   * only once.
   *
   * @method _boot
   *
   * @return {String}
   *
   * @private
   */
  _boot () {
    _.each(ExistingTags, this.tag.bind(this))
  }

  /**
   * Returns the render instance to be used
   * for rendering the template.
   *
   * @method _getRenderer
   *
   * @param  {String}     viewName
   *
   * @return {Object}
   *
   * @private
   */
  _getRenderer (viewName) {
    return new Renderer(viewName, this._tags, this._globals)
  }

  /**
   * Registers a new tag
   *
   * @method tag
   *
   * @param  {Object} tag
   *
   * @return {void}
   *
   * @throws {Error} If tag does not have all required properties
   */
  tag (tag) {
    /**
     * Validate
     */
    if (!tag.tagName || !tag.compile || !tag.run) {
      throw new Error('Cannot register a tag without a tagName, compile and run method')
    }

    /**
     * Register the tag
     */
    this._tags[tag.tagName] = {
      name: tag.tagName,
      isBlock: tag.isBlock,
      compile: tag.compile.bind(tag),
      run: tag.run.bind(tag)
    }

    /**
     * Calling the run method on tag by pass the
     * context. Here any tag can add macros to
     * `Context.prototype`
     */
    tag.run(Context)
  }

  /**
   * Register a new global.
   *
   * @method global
   *
   * @param  {String}   name
   * @param  {Function} fn
   *
   * @return {void}
   *
   * @throws {Error} If fn is not a function
   */
  global (name, fn) {
    if (typeof (fn) !== 'function') {
      throw new Error('edge.global expects 2nd argument to be a function.')
    }
    this._globals[name] = fn
  }

  /**
   * Registers the views path to load views. Path
   * must be absolute.
   *
   * @method registerViews
   *
   * @param  {String}      location
   *
   * @return {void}
   */
  registerViews (location) {
    this._viewsPath = location
    Renderer.viewsPath = location
  }

  /**
   * Renders the string using the renderer instance
   *
   * @method renderString
   *
   * @param  {String}  inputString
   * @param  {Object}  [data = {}]
   *
   * @return {String}
   */
  renderString (inputString, data) {
    return this._getRenderer('unamed').renderString(inputString, data)
  }

  /**
   * Compiles the string using renderer instance and returns
   * a string to be invoked as a function.
   *
   * @method compileString
   *
   * @param  {String}   inputString
   *
   * @return {String}
   */
  compileString (inputString) {
    return this._getRenderer('unamed').compileString(inputString)
  }

  /**
   * Renders a view using it path relative from the
   * registered views directory
   *
   * @method render
   *
   * @param  {String}    view
   * @param  {Object}    [data = {}]
   *
   * @return {String}
   */
  render (view, data) {
    return this._getRenderer(view).render(view, data)
  }
}

module.exports = Edge
