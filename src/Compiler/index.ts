/**
 * @module main
 */

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
import * as Debug from 'debug'

const debug = Debug('edge:loader')

/**
 * Compiler compiles the template to a function, which can be invoked at a later
 * stage.
 * Compiler uses [edge-parser](https://npm.im/edge-parser) under the hood and also
 * handles the layouts.
 * When caching is set to `true`, the compiled templates will be cached to improve performance.
 */
export class Compiler implements ICompiler {
  private cacheStore: Map<string, { template: string, Presenter?: IPresenterConstructor }> = new Map()

  constructor (private loader: ILoader, private tags: Tags, private cache: boolean = true) {
  }

  /**
   * Returns the template and the presenter class from the
   * cache. If caching is disabled, then it will
   * return undefined.
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

    debug('adding to cache %s', templatePath)
    this.cacheStore.set(templatePath, payload)
  }

  /**
   * Generates an array of lexer tokens from the template string. Further tokens
   * are checked for layouts and if layouts are used, their sections will be
   * merged together.
   */
  private _templateContentToTokens (content: string, parser: Parser): INode[] {
    let templateTokens = parser.generateTokens(content)

    const firstToken = templateTokens[0] as IBlockNode
    if (firstToken.type === 'block' && firstToken.properties.name === 'layout') {
      debug('detected layout %s', firstToken.properties.jsArg)

      const layoutTokens = this.generateTokens(firstToken.properties.jsArg.replace(/'/g, ''))
      templateTokens = mergeSections(layoutTokens, templateTokens)
    }

    return templateTokens
  }

  /**
   * Converts the template content to an [array of lexer tokens](https://github.com/poppinss/edge-lexer#nodes). If
   * layouts detected, their sections will be merged together.
   *
   * ```
   * compiler.generateTokens('<template-path>')
   * ```
   */
  public generateTokens (templatePath: string): INode[] {
    const parser = new Parser(this.tags, { filename: templatePath })
    const { template } = this.loader.resolve(templatePath, false)
    return this._templateContentToTokens(template, parser)
  }

  /**
   * Compiles the template contents to a function string, which can be invoked
   * later.
   *
   * When `inline` is set to true, the compiled output will not have it's own scope and
   * neither an attempt to load is made. The `inline` is mainly used for partials.
   *
   * ```js
   * compiler.compile('welcome', false)
   * // output
   *
   * {
   *   template: `function (template, ctx) {
   *     let out = ''
   *     out += ''
   *     return out
   *   })(template, ctx)`,
   *   Presenter: class Presenter | undefined
   * }
   * ```
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
    const templateTokens = this._templateContentToTokens(template, parser)

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
