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

import { Parser } from 'edge-parser'
import { EdgeError } from 'edge-error'
import { Token, TagToken } from 'edge-lexer'

import { CacheManager } from '../CacheManager'
import { isBlockToken, getLineAndColumnForToken } from '../utils'
import { LoaderContract, TagsContract, LoaderTemplate, CompilerContract } from '../Contracts'

/**
 * Compiler compiles the template to a function, which can be invoked at a later
 * stage using the [[Context]]. [edge-parser](https://npm.im/edge-parser) is
 * used under the hood to parse the templates.
 *
 * Also, the `layouts` are handled natively by the compiler. Before starting
 * the parsing process, it will merge the layout sections.
 */
export class Compiler implements CompilerContract {
  private _cacheManager = new CacheManager(this._cache)

  constructor (
    private _loader: LoaderContract,
    private _tags: TagsContract,
    private _cache: boolean = true,
  ) {}

  /**
   * Merges sections of base template and parent template tokens
   */
  private _mergeSections (base: Token[], extended: Token[], filename: string): Token[] {
    /**
     * Collection of all sections from the extended tokens
     */
    const extendedSections: { [key: string]: TagToken } = {}

    /**
     * Collection of extended set calls as top level nodes. Now since they are hanging
     * up in the air, they will be hoisted like `var` statements in Javascript
     */
    const extendedSetCalls: TagToken[] = []

    extended
      .forEach((node) => {
        /**
         * Ignore new lines, layout tag and empty raw nodes inside the parent
         * template
         */
        if (
          isBlockToken(node, 'layout') ||
          node.type === 'newline' ||
          (node.type === 'raw' && !node.value.trim())
        ) {
          return
        }

        /**
         * Collect parent template sections
         */
        if (isBlockToken(node, 'section')) {
          extendedSections[node.properties.jsArg.trim()] = node
          return
        }

        /**
         * Collect set calls inside parent templates
         */
        if (isBlockToken(node, 'set')) {
          extendedSetCalls.push(node)
          return
        }

        /**
         * Everything else if not allowed as top level nodes
         */
        const [line, col] = getLineAndColumnForToken(node)
        throw new EdgeError(
          `Template extending the layout can only define @sections as top level nodes`,
          'E_UNALLOWED_EXPRESSION',
          { line, col, filename },
        )
      })

    /**
     * Replace/extend sections inside base tokens list
     */
    const finalNodes = base
      .map((node) => {
        if (!isBlockToken(node, 'section')) {
          return node
        }

        const extendedNode = extendedSections[node.properties.jsArg.trim()]
        if (!extendedNode) {
          return node
        }

        /**
         * Concat children when super was called
         */
        if (extendedNode.children.length && isBlockToken(extendedNode.children[0], 'super')) {
          extendedNode.children = node.children.concat(extendedNode.children)
        }

        return extendedNode
      })

    /**
     * Set calls are hoisted to the top
     */
    return ([] as Token[]).concat(extendedSetCalls).concat(finalNodes)
  }

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
    if (isBlockToken(firstToken, 'layout')) {
      const layoutTokens = this.generateTokens(firstToken.properties.jsArg.replace(/'/g, ''))
      templateTokens = this._mergeSections(layoutTokens, templateTokens, parser.options.filename)
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
