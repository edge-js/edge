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

import { EdgeError } from 'edge-error'
import { Parser, EdgeBuffer, ParserToken, ParserTagToken } from 'edge-parser'

import { CacheManager } from '../CacheManager'
import { isBlockToken, getLineAndColumnForToken } from '../utils'
import { LoaderContract, TagsContract, LoaderTemplate, CompilerContract } from '../Contracts'

/**
 * Compiler compiles the template to a function, which can be invoked at a later
 * stage using the [[Context]]. [edge-parser](https://npm.im/edge-parser) is
 * used under the hood to parse the templates.
 *
 * Also, the `layouts` are handled natively by the compiler. Before starting
 * the parsing process, it will recursively merge the layout sections.
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
  private _mergeSections (
    base: ParserToken[],
    extended: ParserToken[],
    filename: string,
    layoutPath: string,
  ): ParserToken[] {
    /**
     * Collection of all sections from the extended tokens
     */
    const extendedSections: { [key: string]: ParserTagToken } = {}

    /**
     * Collection of extended set calls as top level nodes. Now since they are hanging
     * up in the air, they will be hoisted like `var` statements in Javascript
     */
    const extendedSetCalls: ParserTagToken[] = []

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
          node.filename = layoutPath
          return node
        }

        const extendedNode = extendedSections[node.properties.jsArg.trim()]
        if (!extendedNode) {
          node.filename = layoutPath
          return node
        }

        /**
         * Concat children when super was called
         */
        if (extendedNode.children.length && isBlockToken(extendedNode.children[0], 'super')) {
          extendedNode.children = node.children.map((child) => {
            (child as ParserToken).filename = layoutPath
            return child
          }).concat(extendedNode.children)
        }

        return extendedNode
      })

    /**
     * Set calls are hoisted to the top
     */
    return ([] as ParserToken[]).concat(extendedSetCalls).concat(finalNodes)
  }

  /**
   * Generates an array of lexer tokens from the template string. Further tokens
   * are checked for layouts and if layouts are used, their sections will be
   * merged together.
   */
  private _templateContentToTokens (
    content: string,
    parser: Parser,
    filename: string,
  ): ParserToken[] {
    let templateTokens = parser.generateLexerTokens(content)
    const firstToken = templateTokens[0]

    /**
     * The `layout` is inbuilt feature from core, where we merge the layout
     * and parent template sections together
     */
    if (isBlockToken(firstToken, 'layout')) {
      const layoutName = firstToken.properties.jsArg.replace(/'/g, '')

      /**
       * Making absolute path, so that lexer errors must point to the
       * absolute file path
       */
      const absPath = this._loader.makePath(layoutName)
      const layoutTokens = this.generateLexerTokens(absPath)

      templateTokens = this._mergeSections(
        layoutTokens,
        templateTokens,
        filename,
        absPath,
      )
    }

    return templateTokens
  }

  /**
   * Converts the template content to an [array of lexer tokens]. The method is
   * same as the `parser.generateLexerTokens`, plus it will handle the layouts
   * and it's sections.
   *
   * ```
   * compiler.generateLexerTokens('<template-path>')
   * ```
   */
  public generateLexerTokens (templatePath: string): ParserToken[] {
    const { template } = this._loader.resolve(templatePath, false)

    const parser = new Parser(this._tags, { filename: templatePath })
    return this._templateContentToTokens(template, parser, templatePath)
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
     * Get a new instance of the parser.
     */
    const parser = new Parser(this._tags, { filename: absPath })

    /**
     * Resolve the template and Presenter using the given loader
     */
    const { template, Presenter } = this._loader.resolve(absPath, loadPresenter)

    /**
     * Convert template to AST. The AST will have the layout actions merged (if layout)
     * is used.
     */
    const templateTokens = this._templateContentToTokens(template, parser, absPath)

    /**
     * Finally process the ast
     */
    const buffer = new EdgeBuffer()
    buffer.writeStatement(`ctx.set('$filename', '${templatePath.replace(/\.edge$/, '')}.edge')`)
    templateTokens.forEach((token) => parser.processLexerToken(token, buffer))

    const payload = {
      template: buffer.flush(wrapAsFunction),
      Presenter,
    }

    this._cacheManager.set(absPath, payload)
    return payload
  }
}
