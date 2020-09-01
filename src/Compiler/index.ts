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
 * Compiler is to used to compile templates using the `edge-parser`. Along with that
 * it natively merges the contents of a layout with a parent template.
 */
export class Compiler implements CompilerContract {
	public cacheManager = new CacheManager(this.cache)

	constructor(
		private loader: LoaderContract,
		private tags: TagsContract,
		private cache: boolean = true
	) {}

	/**
	 * Merges sections of base template and parent template tokens
	 */
	private mergeSections(base: Token[], extended: Token[]): Token[] {
		/**
		 * Collection of all sections from the extended tokens
		 */
		const extendedSections: { [key: string]: TagToken } = {}

		/**
		 * Collection of extended set calls as top level nodes. The set
		 * calls are hoisted just like `var` statements in Javascript.
		 */
		const extendedSetCalls: TagToken[] = []

		extended.forEach((node) => {
			/**
			 * Ignore new lines, comments, layout tag and empty raw nodes inside the parent
			 * template
			 */
			if (
				lexerUtils.isTag(node, 'layout') ||
				node.type === 'newline' ||
				(node.type === 'raw' && !node.value.trim()) ||
				node.type === 'comment'
			) {
				return
			}

			/**
			 * Collect parent template sections
			 */
			if (lexerUtils.isTag(node, 'section')) {
				extendedSections[(node as TagToken).properties.jsArg.trim()] = node
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
				{ line, col, filename: node.filename }
			)
		})

		/**
		 * Replace/extend sections inside base tokens list
		 */
		const finalNodes = base.map((node) => {
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
			if (extendedNode.children.length) {
				if (lexerUtils.isTag(extendedNode.children[0], 'super')) {
					extendedNode.children.shift()
					extendedNode.children = node.children.concat(extendedNode.children)
				} else if (lexerUtils.isTag(extendedNode.children[1], 'super')) {
					extendedNode.children.shift()
					extendedNode.children.shift()
					extendedNode.children = node.children.concat(extendedNode.children)
				}
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
	private templateContentToTokens(content: string, parser: Parser, absPath: string): Token[] {
		let templateTokens = parser.tokenize(content, absPath)
		const firstToken = templateTokens[0]

		/**
		 * The `layout` is inbuilt feature from core, where we merge the layout
		 * and parent template sections together
		 */
		if (lexerUtils.isTag(firstToken, 'layout')) {
			const layoutName = firstToken.properties.jsArg.replace(/'|"/g, '')
			templateTokens = this.mergeSections(this.tokenize(layoutName, parser), templateTokens)
		}

		return templateTokens
	}

	/**
	 * Converts the template content to an array of lexer tokens. The method is
	 * same as the `parser.tokenize`, but it also handles layouts natively.
	 *
	 * ```
	 * compiler.tokenize('<template-path>')
	 * ```
	 */
	public tokenize(templatePath: string, parser?: Parser): Token[] {
		const absPath = this.loader.makePath(templatePath)
		const { template } = this.loader.resolve(absPath)
		return this.templateContentToTokens(template, parser || new Parser(this.tags), absPath)
	}

	/**
	 * Compiles the template contents to string. The output is same as the `edge-parser`,
	 * it's just that the compiler uses the loader to load the templates and also
	 * handles layouts.
	 *
	 * ```js
	 * compiler.compile('welcome')
	 * ```
	 */
	public compile(templatePath: string, localVariables?: string[]): LoaderTemplate {
		const absPath = this.loader.makePath(templatePath)

		/**
		 * If template is in the cache, then return it without
		 * further processing
		 */
		const cachedResponse = this.cacheManager.get(absPath)
		if (cachedResponse) {
			return cachedResponse
		}

		const parser = new Parser(this.tags)
		const buffer = new EdgeBuffer(absPath)

		/**
		 * Define local variables on the parser. This is helpful when trying to compile
		 * a partail and we want to share the local state of the parent template
		 * with it
		 */
		if (localVariables) {
			localVariables.forEach((localVariable) => parser.stack.defineVariable(localVariable))
		}

		const templateTokens = this.tokenize(absPath, parser)
		templateTokens.forEach((token) => parser.processToken(token, buffer))
		const template = buffer.flush()

		this.cacheManager.set(absPath, { template })
		return { template }
	}
}
