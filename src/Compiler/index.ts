/**
 * @module edge
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { Token } from 'edge-lexer'
import { Parser } from 'edge-parser'

import { LoaderContract, Tags, LoaderTemplate } from '../Contracts'
import { mergeSections, isBlock } from '../utils'
import { CacheManager } from '../CacheManager'

/**
 * Compiler compiles the template to a function, which can be invoked at a later
 * stage using the [[Context]]. [edge-parser](https://npm.im/edge-parser) is
 * used under the hood to parse the templates.
 *
 * Also, the `layouts` are handled natively by the compiler. Before starting
 * the parsing process, it will merge the layout sections.
 */
export class Compiler {
  private _cacheManager = new CacheManager(this._cache)

  constructor (
    private _loader: LoaderContract,
    private _tags: Tags,
    private _cache: boolean = true,
  ) {}

  /**
   * Generates an array of lexer tokens from the template string. Further tokens
   * are checked for layouts and if layouts are used, their sections will be
   * merged together.
   */
  private _templateContentToTokens (content: string, parser: Parser): Token[] {
    let templateTokens = parser.generateTokens(content)

    const firstToken = templateTokens[0]

    /**
     * The `layout` is inbuilt feature from core, where we merge the layout
     * and parent template sections together
     */
    if (isBlock(firstToken, 'layout')) {
      const layoutTokens = this.generateTokens(firstToken.properties.jsArg.replace(/'/g, ''))
      templateTokens = mergeSections(layoutTokens, templateTokens)
    }

    return templateTokens
  }

  /**
   * Converts the template content to an [array of lexer tokens](https://github.com/edge-js/edge-lexer#nodes). If
   * layouts detected, their sections will be merged together.
   *
   * ```
   * compiler.generateTokens('<template-path>')
   * ```
   */
  public generateTokens (templatePath: string): Token[] {
    const { template } = this._loader.resolve(templatePath, false)

    const parser = new Parser(this._tags, { filename: templatePath })
    return this._templateContentToTokens(template, parser)
  }

  /**
   * Compiles the template contents to a function string, which can be invoked
   * later.
   *
   * When `inline` is set to true, the compiled output **will not have it's own scope** and
   * neither an attempt to load the presenter is made. The `inline` is mainly used for partials.
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
  public compile (templatePath: string, inline: boolean): LoaderTemplate {
    const absPath = this._loader.makePath(templatePath)

    /**
     * If template is in the cache, then return it without
     * further processing
     */
    const cachedResponse = this._cacheManager.get(absPath)
    if (cachedResponse) {
      return cachedResponse
    }

    /**
     * Do not load presenter in inline mode
     */
    const loadPresenter = !inline

    /**
     * Inline templates are not wrapped inside a function
     * call. They share the parent template scope
     */
    const wrapAsFunction = !inline

    /**
     * Get a new instance of the parser. We use the `templatePath` as the filename
     * instead of the `absPath`, since `templatePath` are relative and readable.
     */
    const parser = new Parser(this._tags, {
      filename: `${templatePath.replace(/\.edge$/, '')}.edge`,
    })

    /**
     * Resolve the template and Presenter using the given loader
     */
    const { template, Presenter } = this._loader.resolve(absPath, loadPresenter)

    /**
     * Convert template to AST. The AST will have the layout actions merged (if layout)
     * is used.
     */
    const templateTokens = this._templateContentToTokens(template, parser)

    /**
     * Finally process the ast
     */
    const payload = {
      template: parser.processTokens(templateTokens, wrapAsFunction),
      Presenter,
    }

    this._cacheManager.set(absPath, payload)
    return payload
  }
}
