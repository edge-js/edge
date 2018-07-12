/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { ILoader, IPresenterConstructor, ICompiler, Tags } from '../Contracts'

export class Compiler implements ICompiler {
  private cacheStore: Map<string, { template: string, Presenter?: IPresenterConstructor }> = new Map()

  constructor (private loader: ILoader, private tags: Tags, public cache: boolean = true) {
  }

  /**
   * Returns the template and the presenter class from the
   * cache. If caching is disabled, then it will
   * return undefined
   */
  private _getFromCache (templatePath: string): undefined | { template: string, Presenter?: IPresenterConstructor } {
    if (!this.cache) {
      return
    }

    return this.cacheStore.get(templatePath)
  }

  /**
   * Set's the template path and the payload to the cache. If
   * cache is disable, then it will never be set.
   */
  private _setInCache (templatePath: string, payload: { template: string, Presenter?: IPresenterConstructor }) {
    if (!this.cache) {
      return
    }

    this.cacheStore.set(templatePath, payload)
  }

  /**
   * Compiles a given template by loading it using the loader, also caches
   * the template and returns from the cache (if exists).
   *
   * When the `inline` property is set to true, the Presenter resolution
   * will not happen, since Presenters are tied to the top level
   * views and not partials.
   */
  public compile (templatePath: string, inline: boolean): { template: string, Presenter?: IPresenterConstructor } {
    templatePath = this.loader.makePath(templatePath)

    const cachedResponse = this._getFromCache(templatePath)
    if (cachedResponse) {
      return cachedResponse
    }

    const { template, Presenter } = this.loader.resolve(templatePath, !inline)
    const payload = {
      template: new Parser(this.tags, { filename: templatePath }) .parseTemplate(template, !inline),
      Presenter,
    }

    this._setInCache(templatePath, payload)
    return payload
  }
}
