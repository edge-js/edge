/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Parser } from 'edge-parser'
import { INode, IBlockNode } from 'edge-lexer/build/src/Contracts'
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
   * Returns an array of lexer tokens
   */
  public generateTokens (templatePath: string): INode[] {
    templatePath = this.loader.makePath(templatePath)
    const { template } = this.loader.resolve(templatePath, false)
    return new Parser(this.tags).generateTokens(template)
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
    const parser = new Parser(this.tags)

    const templateTokens = parser.generateTokens(template)
    if (templateTokens[0].type === 'block' && (templateTokens[0] as IBlockNode).properties.name === 'layout') {
    }

    const payload = {
      template: new Parser(this.tags).parseTemplate(template, !inline),
      Presenter,
    }

    this._setInCache(templatePath, payload)
    return payload
  }
}
