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
import { mergeSections } from '../utils'

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
   * Converts the content of a template to AST. If layouts are
   * used, they will be merged together to form the final
   * AST
   */
  public templateContentToAst (content: string, parser: Parser): INode[] {
    let templateTokens = parser.generateTokens(content)

    const firstToken = templateTokens[0] as IBlockNode
    if (firstToken.type === 'block' && firstToken.properties.name === 'layout') {
      const layoutTokens = this.compileToAst(firstToken.properties.jsArg.replace(/'/g, ''))
      templateTokens = mergeSections(layoutTokens, templateTokens)
    }

    return templateTokens
  }

  /**
   * Compiles a template by resolving it from the loader
   * and then compiling it's contents to AST
   */
  public compileToAst (templatePath: string): INode[] {
    const parser = new Parser(this.tags, { filename: templatePath })
    const { template } = this.loader.resolve(templatePath, false)
    return this.templateContentToAst(template, parser)
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

    /**
     * If template is in the cache, then return it without
     * further processing
     */
    const cachedResponse = this._getFromCache(templatePath)
    if (cachedResponse) {
      return cachedResponse
    }

    /**
     * Get a new instance of the parser
     */
    const parser = new Parser(this.tags, { filename: templatePath })

    /**
     * Resolve the base template from loader
     */
    const { template, Presenter } = this.loader.resolve(templatePath, !inline)

    /**
     * Convert template to AST. So that we can merge the layout tokens
     */
    const templateTokens = this.templateContentToAst(template, parser)

    /**
     * Finally process the ast
     */
    const payload = {
      template: parser.parseTokens(templateTokens, !inline),
      Presenter,
    }

    this._setInCache(templatePath, payload)
    return payload
  }
}
