/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { EdgeError } from 'edge-error'
import { Parser, EdgeBuffer } from 'edge-parser'
import { Token, TagToken, utils as lexerUtils } from 'edge-lexer'

import { CacheManager } from '../CacheManager'
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
  public cacheManager = new CacheManager(this.cache)

  constructor (
    private loader: LoaderContract,
    private tags: TagsContract,
    private cache: boolean = true,
  ) {}

  /**
   * Merges sections of base template and parent template tokens
   */
  private mergeSections (base: Token[], extended: Token[]): Token[] {
    /**
     * Collection of all sections from the extended tokens
     */
    const extendedSections: { [key: string]: TagToken } = {}

    /**
     * Collection of extended set calls as top level nodes. The set
     * calls are hoisted just like `var` statements in Javascript.
     */
    const extendedSetCalls: TagToken[] = []

    extended
      .forEach((node) => {
        /**
         * Ignore new lines, layout tag and empty raw nodes inside the parent
         * template
         */
        if (
          lexerUtils.isTag(node, 'layout') ||
          node.type === 'newline' ||
          (node.type === 'raw' && !node.value.trim())
        ) {
          return
        }

        /**
         * Collect parent template sections
         */
        if (lexerUtils.isTag(node, 'section')) {
          extendedSections[node.properties.jsArg.trim()] = node
          return
        }

        /**
         * Collect set calls inside parent templates
         */
        if (lexerUtils.isTag(node, 'set')) {
          extendedSetCalls.push(node)
          return
        }

        /**
         * Everything else is not allowed as top level nodes
         */
        const [line, col] = lexerUtils.getLineAndColumn(node)

        throw new EdgeError(
          'Template extending a layout can only use "@section" or "@set" tags as top level nodes',
          'E_UNALLOWED_EXPRESSION',
          { line, col, filename: node.filename },
        )
      })

    /**
     * Replace/extend sections inside base tokens list
     */
    const finalNodes = base
      .map((node) => {
        if (!lexerUtils.isTag(node, 'section')) {
          return node
        }

        const sectionName = node.properties.jsArg.trim()
        const extendedNode = extendedSections[sectionName]
        if (!extendedNode) {
          return node
        }

        /**
         * Concat children when super was called
         */
        if (extendedNode.children.length && lexerUtils.isTag(extendedNode.children[0], 'super')) {
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
  private templateContentToTokens (content: string, parser: Parser): Token[] {
    let templateTokens = parser.tokenize(content)
    const firstToken = templateTokens[0]

    /**
     * The `layout` is inbuilt feature from core, where we merge the layout
     * and parent template sections together
     */
    if (lexerUtils.isTag(firstToken, 'layout')) {
      const layoutName = firstToken.properties.jsArg.replace(/'|"/g, '')
      templateTokens = this.mergeSections(this.tokenize(layoutName), templateTokens)
    }

    return templateTokens
  }

  /**
   * Converts the template content to an [array of lexer tokens]. The method is
   * same as the `parser.tokenize`, but it also handles layouts natively.
   *
   * ```
   * compiler.tokenize('<template-path>')
   * ```
   */
  public tokenize (templatePath: string): Token[] {
    const absPath = this.loader.makePath(templatePath)
    const { template } = this.loader.resolve(absPath, false)

    const parser = new Parser(this.tags, { filename: absPath })
    return this.templateContentToTokens(template, parser)
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
    const absPath = this.loader.makePath(templatePath)

    /**
     * If template is in the cache, then return it without
     * further processing
     */
    const cachedResponse = this.cacheManager.get(absPath)
    if (cachedResponse) {
      return cachedResponse
    }

    /**
     * Do not return presenter in inline mode
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
    const parser = new Parser(this.tags, { filename: absPath })

    /**
     * Resolve the template and Presenter using the given loader. We always
     * load the presenter but don't return it when `loadPresenter = false`.
     */
    const { template, Presenter } = this.loader.resolve(absPath, true)

    /**
     * Convert template to AST. The AST will have the layout actions merged (if layout)
     * is used.
     */
    const templateTokens = this.templateContentToTokens(template, parser)

    /**
     * Finally process the ast
     */
    const buffer = new EdgeBuffer(absPath, wrapAsFunction)
    templateTokens.forEach((token) => parser.processToken(token, buffer))

    const payload = {
      template: buffer.flush(),
      Presenter,
    }

    this.cacheManager.set(absPath, payload)
    return loadPresenter ? payload : { template: payload.template }
  }
}
