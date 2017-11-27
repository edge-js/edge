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
const Template = require('../Template')
const Loader = require('../Loader')
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
    this._globals = require('../Globals')
    this._loader = new Loader()
    this._options = {
      cache: false
    }
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
   * @method _getTemplate
   *
   * @return {Template}
   *
   * @private
   */
  _getTemplate () {
    return new Template(this._tags, {
      cache: this._options.cache
    }, this._globals, this._loader)
  }

  /**
   * Returns a fresh instance of template
   *
   * @method new
   *
   * @returns {Template}
   */
  new () {
    return this._getTemplate()
  }

  /**
   * Registers a new tag. A tag must have following
   * attributes.
   *
   * 1. tagName
   * 2. compile
   * 3. run
   *
   * @method tag
   *
   * @param  {Class} tag
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
      isBlock: !!tag.isBlock,
      compile: tag.compile.bind(tag),
      run: tag.run.bind(tag)
    }

    /**
     * We pass context to the run method of the
     * tag. The run method should make use
     * of macro function to add methods
     * to the context prototype.
     */
    tag.run(Context)
  }

  /**
   * Configure edge by passing object of options.
   *
   * @method configure
   *
   * @param  {Object}  options
   *
   * @return {void}
   */
  configure (options) {
    this._options = _.merge(this._options, options)
  }

  /**
   * Register a new global.
   *
   * @method global
   *
   * @param  {String}   name
   * @param  {Mixed}    value
   *
   * @return {void}
   */
  global (name, value) {
    this._globals[name] = value
  }

  /**
   * Registers the views path to load views. Path
   * must be absolute.
   *
   * **Note** This method does not validates whether
   * path exists or not.
   *
   * @method registerViews
   *
   * @param  {String}      location
   *
   * @return {void}
   */
  registerViews (location) {
    this._loader.viewsPath = location
  }

  /**
   * Register the path from where to load the presenters
   *
   * @method registerPresenters
   *
   * @return {void}
   */
  registerPresenters (location) {
    this._loader.presentersPath = location
  }

  /**
   * docblock defined in template renderer
   */
  renderString (...args) {
    return this.new().renderString(...args)
  }

  /**
   * docblock defined in template renderer
   */
  compileString (...args) {
    return this.new().compileString(...args)
  }

  /**
   * docblock defined in template renderer
   */
  render (view, ...args) {
    return this.new().render(view, ...args)
  }

  /**
   * docblock defined in template renderer
   */
  compile (view, ...args) {
    return this.new().compile(view, ...args)
  }

  /**
   * docblock defined in template renderer
   */
  presenter (...args) {
    return this.new().presenter(...args)
  }

  /**
   * docblock defined in template renderer
   */
  share (...args) {
    return this.new().share(...args)
  }
}

module.exports = Edge
