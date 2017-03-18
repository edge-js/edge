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
const TemplateCompiler = require('./Compiler')
const TemplateRunner = require('./Runner')
const Context = require('../Context')
const BasePresenter = require('../Presenter')

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
  constructor (tags, globals = {}, loader = null) {
    this._tags = tags
    this._globals = globals
    this._loader = loader
    this._viewToBeUsed = null

    this._locals = {}
    this._presenter = null
    this.context = null
  }

  /**
   * Prepares the stack by adding the view file name
   * lineno and charno where the error has occured.
   *
   * @method _prepareStack
   *
   * @param  {Object}      error
   *
   * @return {Object}
   *
   * @private
   */
  _prepareStack (error) {
    if (!error.lineno) {
      return error
    }

    /**
     * If view has been loaded for a directory, update the
     * stack by referencing the actual views path.
     */
    if (this._viewToBeUsed && this._loader.viewsPath) {
      const stack = error.stack.split('\n')
      stack.splice(2, 0, `at (${this._loader.getViewPath(this._viewToBeUsed)}:${error.lineno}:${error.charno})`)
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
    const Presenter = this._presenter ? this._loader.loadPresenter(this._presenter) : BasePresenter
    const presenter = new Presenter(data, this._locals)
    this.context = new Context(this._viewToBeUsed || 'raw string', presenter, this._globals)
  }

  /**
   * The view file to be used for reporting errors.
   * Since we parse the raw view file, we need to
   * report the error on the source file instead
   * stack trace containing references to edge
   * codebase.
   *
   * @method sourceView
   *
   * @param  {String}   view
   *
   * @chainable
   */
  sourceView (view) {
    this._viewToBeUsed = view
    return this
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
    this._locals = locals
    return this
  }

  /**
   * Compiles a view by loading it from the
   * registered views path
   *
   * @method compile
   *
   * @param  {String}  view
   * @param  {Boolean} asFunction
   *
   * @return {String}
   */
  compile (view, asFunction = false) {
    const compiler = new TemplateCompiler(this._tags, this._loader, asFunction)
    try {
      return compiler.compile(view)
    } catch (error) {
      throw (this._prepareStack(error))
    }
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
      throw (this._prepareStack(error))
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
    this.sourceView(view)
    const compiledTemplate = this._loader.loadPreCompiled(view) || this.compile(view, true)
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
    const compiledTemplate = this._loader.loadPreCompiled(view) || this.compile(view, true)
    const template = new TemplateRunner(compiledTemplate, this).run()
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
    const data = _.transform(props, (result, prop) => {
      _.merge(result, prop)
      return result
    }, {})

    const template = new Template(this._tags, this._globals, this._loader)
    template.sourceView(this._viewToBeUsed)
    template._makeContext(data)
    return template
  }
}

module.exports = Template
