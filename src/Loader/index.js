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
const requireUncached = require('require-uncached')
const CE = require('../Exceptions')

/**
 * Loader class is used to load views, presenters
 * and pre compiled views for the registered
 * directories.
 *
 * @class Loader
 */
class Loader {
  constructor (viewsPath, presentersPath) {
    this._viewsPath = viewsPath
    this._presentersPath = presentersPath
  }

  /**
   * The path from where to load the views.
   *
   * @attribute viewsPath
   *
   * @return {String}
   */
  get viewsPath () {
    return this._viewsPath
  }

  /**
   * Set the views path
   *
   * @param  {String}  viewsPath
   */
  set viewsPath (viewsPath) {
    this._viewsPath = viewsPath
  }

  /**
   * The path from where to load the presenters.
   *
   * @attribute presentersPath
   *
   * @return {String}
   */
  get presentersPath () {
    return this._presentersPath
  }

  /**
   * Set the presenters path
   *
   * @param  {String}       presentersPath
   */
  set presentersPath (presentersPath) {
    this._presentersPath = presentersPath
  }

  /**
   * Normalizes the view name
   *
   * @method _normalizeViewName
   *
   * @param  {String}           view
   * @param  {String}           [extension = edge]
   *
   * @return {String}
   *
   * @example
   * ```
   * 'partials.users'
   * // will become
   * 'partials/users.edge'
   * ```
   *
   * @private
   */
  normalizeViewName (view, extension = 'edge') {
    return `${view.replace(/\.edge$/, '').replace(/\.(\w+|\d+)/g, '/$1').replace(/\/{3}/, '.')}.${extension}`
  }

  /**
   * Returns the absolute path to a given
   * view, considering `this._viewsPath`
   * as the root.
   *
   * @method getViewPath
   *
   * @param  {String}    view
   *
   * @return {String}
   */
  getViewPath (view) {
    /**
     * Views path has not been registered and trying
     * to load a view
     */
    if (!this.viewsPath) {
      throw CE.RuntimeException.unregisteredViews(view)
    }

    return path.join(this.viewsPath, view)
  }

  /**
   * Load a view from the views path
   *
   * @method load
   *
   * @param  {String} view
   *
   * @return {String}
   *
   * @throws {RunTimeException} If unable to load the view
   */
  load (view) {
    if (!view) {
      throw new CE.RuntimeException('You are trying to a undefined view. Please contact package author.')
    }

    try {
      return fs.readFileSync(this.getViewPath(view), 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw CE.RuntimeException.missingView(view, this._viewsPath)
      }
      throw error
    }
  }

  /**
   * Loads the presenter from presenters directory.
   *
   * @method loadPresenter
   *
   * @param  {String}      presenter
   *
   * @return {String}
   */
  loadPresenter (presenter, clearCache = false) {
    /**
     * Presenters path has not been registered and trying
     * to load a presenter.
     */
    if (!this.presentersPath) {
      throw CE.RuntimeException.unregisterdPresenters(presenter)
    }

    try {
      const presenterPath = path.join(this.presentersPath, presenter)
      return clearCache ? requireUncached(presenterPath) : require(presenterPath)
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw CE.RuntimeException.missingPresenter(presenter, this.presentersPath)
      }
      throw error
    }
  }
}

module.exports = Loader
