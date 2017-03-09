'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const fs = require('fs')
const path = require('path')
const TemplateRunner = require('../Template/Runner')
const TemplateCompiler = require('../Template/Compiler')
const BasePresenter = require('../Presenter')
const Context = require('../Context')

/**
 * Template render is responsible for rendering
 * a single template. Having a seperate instance
 * of each template gives a chance to have locals
 * for each template.
 *
 * This class is consumed by Edge class.
 *
 * @class TemplateRender.
 */
class TemplateRender {
  constructor (viewName, tags, globals) {
    this._globals = globals
    this._tags = tags
    this._viewName = viewName

    // For each template
    this._presenterForView = null
    this._locals = {}
  }

  /**
   * Returns the path to the presenters
   * directory
   *
   * @attribute presentersPath
   *
   * @return {String}
   */
  static get presentersPath () {
    return this._presenterPath
  }

  /**
   * Setting the path to presenters directory
   *
   * @param  {String}       presentersPath
   *
   * @return {void}
   */
  static set presentersPath (presentersPath) {
    this._presenterPath = presentersPath
  }

  /**
   * Returns path to the views directory
   *
   * @attribute viewsPath
   *
   * @return {String}
   */
  static get viewsPath () {
    return this._viewsPath
  }

  /**
   * Set path to the views directory
   *
   * @param  {String}  viewsPath
   *
   * @return {void}
   */
  static set viewsPath (viewsPath) {
    this._viewsPath = viewsPath
  }

  /**
   * Returns the presenter to be used when making
   * views context
   *
   * @method _getPresenter
   *
   * @return {Class}
   *
   * @private
   */
  _getPresenter () {
    return this._presenterToUser ? require(this._presenterPath) : BasePresenter
  }

  /**
   * Return the context object
   *
   * @method _makeContext
   *
   * @param {Object} data
   *
   * @return {Object}
   *
   * @private
   */
  _makeContext (data) {
    const Presenter = this._getPresenter()
    return new Context(this._viewName, new Presenter(data, this._locals), this._globals)
  }

  /**
   * Normalizes the view name by replace `.edge`
   * from last and then adding it back
   *
   * @method _normalizeViewName
   *
   * @param  {String}           view
   *
   * @return {String}
   *
   * @private
   */
  _normalizeViewName (view) {
    return `${view.replace(/\.edge$/, '')}.edge`
  }

  /**
   * Synchronously render a view by reading the
   * template engine and processing it
   *
   * @method _renderSync
   *
   * @param  {String}    view
   * @param  {Object}    data
   *
   * @return {String}
   *
   * @throws {Error} If view does not exists
   *
   * @private
   */
  _renderSync (view, data) {
    const viewsPath = this.constructor.viewsPath
    const absoluteViewPath = path.join(viewsPath, view)
    try {
      const output = fs.readFileSync(absoluteViewPath, 'utf-8')
      return this.renderString(output, data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Cannot render ${view}. Make sure the file exists at ${viewsPath} location.`)
      }
      throw (error)
    }
  }

  /**
   * Compile input string to a compiled template.
   *
   * @method compileString
   *
   * @param  {String}      inputString
   *
   * @return {String}
   */
  compileString (inputString) {
    return new TemplateCompiler(this._tags, inputString).compile()
  }

  /**
   * Renders an input string
   *
   * @method renderString
   *
   * @param  {String}     inputString
   * @param  {Object}     [data = {}]
   *
   * @return {String}
   */
  renderString (inputString, data = {}) {
    return new TemplateRunner(this.compileString(inputString), this._makeContext(data)).run()
  }

  /**
   * Renders a view using it path relative from the
   * registered views directory.
   *
   * @method render
   *
   * @param  {String} view
   * @param  {Object} [data = {}]
   *
   * @return {String}
   */
  render (view, data = {}) {
    view = this._normalizeViewName(view)

    /**
     * If there is no viewsPath register, we cannot render
     * the view. So sorry have fun
     */
    if (!this.constructor.viewsPath) {
      throw new Error(`Cannot render ${view}. Make sure to register views path first`)
    }

    return this._renderSync(view, data)
  }
}

/**
 * Set presentersPath and viewsPath
 * to null by default. The edge
 * public api should set it
 * via getter/setters.
 */
TemplateRender._presenterPath = null
TemplateRender._viewsPath = null

module.exports = TemplateRender
