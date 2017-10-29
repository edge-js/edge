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
const debug = require('debug')('edge:template')
const TemplateCompiler = require('./Compiler')
const TemplateRunner = require('./Runner')
const Context = require('../Context')
const BasePresenter = require('../Presenter')
const cache = require('../Cache')

/**
 * Template class is used to compile and render the
 * views. Each view file or view string will have
 * a single instance of template class.
 *
 * ## Compile Time
 * The first phase of the view is the compile time, here
 * the view string is converted into AST and further
 * processed into a compiled view, can be used saved
 * to a Javascript file.
 *
 * ## Runtime
 * Runtime is the another phase of a template, where the compiled
 * template is loaded and run. The runtime scope of the template
 * is bound to the template instance. Which means `this` will
 * have access to all the methods of this class.
 *
 * @class Template
 * @constructor
 */
class Template {
  constructor (tags, options, globals = {}, loader = null) {
    this._tags = tags
    this._globals = globals
    this._loader = loader
    this._viewName = 'raw string'
    this._runTimeViews = []
    this._options = options

    this._locals = {}
    this._presenter = null
    this.context = null
  }

  /**
   * The view to be used in runtime
   *
   * @method runtimeViewName
   *
   * @return {String}
   */
  get runtimeViewName () {
    return _.last(this._runTimeViews) || this._viewName || 'raw string'
  }

  /**
   * Prepares the stack by adding the view file name
   * lineno and charno where the error has occured.
   *
   * @method _prepareStack
   *
   * @param  {String}      view
   * @param  {Object}      error
   *
   * @return {Object}
   *
   * @private
   */
  _prepareStack (view, error) {
    if (!error.lineno) {
      return error
    }

    /**
     * Set the charno to 1 when undefined.
     */
    error.charno = error.charno || 1

    /**
     * If view has been loaded for a directory, update the
     * stack by referencing the actual views path.
     */
    if (view !== 'raw string' && this._loader.viewsPath) {
      const stack = error.stack.split('\n')
      stack.splice(1, 0, `    at (${this._loader.getViewPath(view)}:${error.lineno}:${error.charno})`)
      error.stack = stack.join('\n')
      return error
    }

    /**
     * Otherwise update the lineno and charno on the error
     * message.
     */
    error.message = `lineno:${error.lineno} charno:${error.charno} ${error.message}`
    return error
  }

  /**
   * Returns a new instance of context to be
   * used for running template.
   *
   * @method _makeContext
   *
   * @param  {Object}     data
   *
   * @return {Object}
   *
   * @private
   */
  _makeContext (data) {
    const Presenter = this._presenter ? this._loader.loadPresenter(this._presenter, !this._options.cache) : BasePresenter
    const presenter = new Presenter(data, this._locals)
    /**
     * We should always make the context with the original view
     * name and update it later when required.
     */
    this.context = new Context(this._viewName, presenter, this._globals)
  }

  /**
   * Add view name to the list of runtime views
   *
   * @method _addRunTimeView
   *
   * @param  {String}        view
   *
   * @private
   */
  _addRunTimeView (view) {
    this._runTimeViews.push(view)
  }

  /**
   * Remove last view from the list of runtime view.
   * In short it calls `Array.pop()`
   *
   * @method _removeRunTimeView
   *
   * @return {void}
   *
   * @private
   */
  _removeRunTimeView () {
    this._runTimeViews.pop()
  }

  /**
   * Return the view from cache if cachining is
   * turned on.
   *
   * @method _getFromCache
   *
   * @param  {String}      view
   *
   * @return {String|Null}
   *
   * @private
   */
  _getFromCache (view) {
    if (!this._options.cache) {
      return null
    }
    return cache.get(view)
  }

  /**
   * Save view to cache when caching is turned on
   *
   * @method _saveToCache
   *
   * @param  {String}     view
   * @param  {String}     output
   *
   * @return {void}
   *
   * @private
   */
  _saveToCache (view, output) {
    if (!this._options.cache) {
      return
    }
    cache.add(view, output)
    debug('adding view %s to cache', view)
  }

  /**
   * Compile a view by loading it from the disk and
   * cache the view when caching is set to true.
   *
   * @method _compileView
   *
   * @param  {String}     view
   * @param  {Boolean}     [asFunction = true]
   *
   * @return {String}
   */
  _compileView (view, asFunction = true) {
    const preCompiledView = this._getFromCache(view)

    /**
     * Return the precompiled view from the cache if
     * it exists.
     */
    if (preCompiledView) {
      debug('resolving view %s from cache', view)
      return preCompiledView
    }

    const compiler = new TemplateCompiler(this._tags, this._loader, asFunction)

    try {
      const compiledView = compiler.compile(view)
      this._saveToCache(view, compiledView)
      return compiledView
    } catch (error) {
      throw this._prepareStack(view, error)
    }
  }

  /**
   * The presenter to be used when rendering
   * the view.
   *
   * @method presenter
   *
   * @param  {String}  presenter
   *
   * @chainable
   */
  presenter (presenter) {
    this._presenter = presenter
    return this
  }

  /**
   * Share the locals to be used when rendering
   * the view.
   *
   * @method share
   *
   * @param  {Object} locals
   *
   * @chainable
   */
  share (locals) {
    _.merge(this._locals, locals)
    return this
  }

  /**
   * The view to be compiled or to be
   * rendered later
   *
   * @method view
   *
   * @param  {String} viewName
   *
   * @chainable
   */
  setView (viewName) {
    this._viewName = this._loader.normalizeViewName(viewName)
    return this
  }

  /**
   * Compiles a view by loading it from the
   * registered views path
   *
   * @method compile
   *
   * @param  {String} view
   * @param  {Boolean} [asFunction = true]
   *
   * @return {String}
   */
  compile (view, asFunction = true) {
    this.setView(view)
    return this._compileView(this._viewName, asFunction)
  }

  /**
   * Compiles the string as a view.
   *
   * @method compileString
   *
   * @param  {String}      statement
   * @param  {Boolean}     asFunction
   *
   * @return {String}
   */
  compileString (statement, asFunction = true) {
    const compiler = new TemplateCompiler(this._tags, this._loader, asFunction)
    try {
      return compiler.compileString(statement)
    } catch (error) {
      throw (this._prepareStack('raw string', error))
    }
  }

  /**
   * Render a view by loading it from the disk
   *
   * @method render
   *
   * @param  {String} view
   * @param  {Object} data
   *
   * @return {String}
   */
  render (view, data = {}) {
    const compiledTemplate = this.compile(view, true)
    this._makeContext(data)
    return new TemplateRunner(compiledTemplate, this).run()
  }

  /**
   * Render a view via string
   *
   * @method renderString
   *
   * @param  {String}     statement
   * @param  {Object}     data
   *
   * @return {String}
   */
  renderString (statement, data = {}) {
    const compiledTemplate = this.compileString(statement)
    this._makeContext(data)
    return new TemplateRunner(compiledTemplate, this).run()
  }

  /**
   * Render a view at runtime. The runtime view has
   * scope of it's parent template.
   *
   * @method runTimeRender
   *
   * @param  {String}      view
   *
   * @return {String}
   */
  runTimeRender (view) {
    /**
     * Normalize the view name for proper error tracking
     * and loading the view from disk
     */
    view = this._loader.normalizeViewName(view)

    /**
     * Compile view in runtime
     */
    const compiledTemplate = this._compileView(view)

    /**
     * Add view to the runtime stack and update viewName on
     * context so that runtime context should point to the
     * correct view name.
     */
    this._addRunTimeView(view)
    this.context.$viewName = this.runtimeViewName

    /**
     * Run the compiled template
     */
    const template = new TemplateRunner(compiledTemplate, this).run()

    /**
     * Pop the runtime stack to switch the context
     * back to 1 leve up viewname and also update
     * the context.
     */
    this._removeRunTimeView()
    this.context.$viewName = this.runtimeViewName

    return template
  }

  /**
   * Create an islotated layer within the
   * rendering function
   *
   * @method isolate
   *
   * @param  {Function} callback
   *
   * @return {void}
   */
  isolate (callback) {
    callback()
  }

  /**
   * Creates a new runtime context.
   *
   * @method newContext
   *
   * @param  {Spread}   [props]
   *
   * @return {Object}
   */
  newContext (...props) {
    /**
     * Convert props array to data object
     */
    let presenter = null

    const data = _.transform(props, (result, prop) => {
      if (prop.presenter) {
        presenter = prop.presenter
      } else {
        _.merge(result, prop)
      }
      return result
    }, {})

    const template = new Template(this._tags, this._options, this._globals, this._loader)
    template.presenter(presenter)
    template._makeContext(data)

    return template
  }

  /**
   * Render the view with existing context. In short do not create
   * a new context and assume that `this.context` exists.
   *
   * @method renderWithContext
   *
   * @param  {String}          view
   *
   * @return {String}
   */
  renderWithContext (view) {
    const compiledTemplate = this.compile(view, true)
    this.context.$viewName = this._viewName
    return new TemplateRunner(compiledTemplate, this).run()
  }
}

module.exports = Template
