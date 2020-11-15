/**
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Token, TagToken } from 'edge-lexer'
import { MacroableConstructorContract } from 'macroable'
import { ParserTagDefinitionContract, Parser, EdgeBuffer } from 'edge-parser'

/**
 * The shape in which the loader must resolve the template
 */
export type LoaderTemplate = {
	template: string
}

/**
 * Loader contract that every loader must adheres to.
 */
export interface LoaderContract {
	/**
	 * List of mounted disks
	 */
	mounted: { [diskName: string]: string }

	/**
	 * List of pre-registered template
	 */
	templates: { [templatePath: string]: LoaderTemplate }

	/**
	 * Save disk name and dirPath to resolve views
	 */
	mount(diskName: string, dirPath: string): void

	/**
	 * Remove disk from the previously saved paths
	 */
	unmount(diskName: string): void

	/**
	 * Resolve template contents
	 */
	resolve(templatePath: string): LoaderTemplate

	/**
	 * Make absolute path to a template
	 */
	makePath(templatePath: string): string

	/**
	 * Register in memory template and presenter
	 */
	register(templatePath: string, contents: LoaderTemplate): void
}

/**
 * Shape of runtime context
 */
export interface ContextContract {
	escape<T>(input: T): T
	reThrow(error: any, filename: string, linenumber: number): never
}

/**
 * Shape of context constructor
 */
export interface ContextConstructorContract extends MacroableConstructorContract<ContextContract> {
	new (): ContextContract
}

/**
 * The tag must have a tagName along with other properties
 * required by lexer and parser
 */
export interface TagContract extends ParserTagDefinitionContract {
	tagName: string
	run?(context: ContextConstructorContract): void
}

/**
 * Shape of required tags
 */
export type TagsContract = {
	[tagName: string]: TagContract
}

/**
 * Shape of the cache manager
 */
export interface CacheManagerContract {
	get(templatePath: string): undefined | LoaderTemplate
	set(templatePath: string, compiledOutput: LoaderTemplate): void
	has(templatePath: string): boolean
}

/**
 * Shape of the compiler
 */
export interface CompilerContract {
	cacheManager: CacheManagerContract
	compile(templatePath: string, localVariables?: string[]): LoaderTemplate
	tokenize(templatePath: string, parser?: Parser): Token[]
}

/**
 * Shape of the template contract
 */
export interface TemplateContract {
	renderInline(templatePath: string, ...localVariables: string[]): Function
	renderWithState(template: string, state: any, slots: any): string
	render(template: string, state: any): string
}

/**
 * Shape of the renderer that renders the edge templates
 */
export interface EdgeRendererContract {
	share(locals: any): this
	render(templatePath: string, state?: any): string
}

/**
 * The processor is used to execute process functions for different
 * lifecycles
 */
export interface ProcessorContract {
	/**
	 * Define a processor handler
	 */
	process(event: 'raw', handler: (data: { raw: string; path: string }) => string | void): this
	process(
		event: 'compiled',
		handler: (data: { compiled: string; path: string }) => string | void
	): this
	process(
		event: 'output',
		handler: (data: { output: string; template: TemplateContract }) => string | void
	): this
}

/**
 * Shape of options that can be passed to the
 * edge constructor
 */
export type EdgeOptions = {
	loader?: LoaderContract
	cache?: boolean
}

/**
 * Shape of the main module
 */
export interface EdgeContract extends ProcessorContract {
	loader: LoaderContract
	compiler: CompilerContract
	GLOBALS: { [key: string]: any }
	tags: { [name: string]: TagContract }

	/**
	 * Register a plugin
	 */
	use(pluginFn: (edge: this) => void): this

	registerTag(tag: TagContract): this
	registerTemplate(templatePath: string, contents: LoaderTemplate): this
	global(key: string, value: any): this

	mount(diskName: string): this
	mount(diskName: string, dirPath: string): this
	unmount(diskName: string): this

	getRenderer(): EdgeRendererContract
	share(locals: any): EdgeRendererContract
	render(templatePath: string, state?: any): string
}

/**
 * Required for someone creating custom tags
 */
export type EdgeBufferContract = EdgeBuffer
export type ParserContract = Parser
export type TagTokenContract = TagToken
