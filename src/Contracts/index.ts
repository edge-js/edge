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
import { ParserTagDefinitionContract, Parser, EdgeBuffer, ClaimTagFn } from 'edge-parser'

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

  /**
   * Remove the pre-registered template
   */
  remove(templatePath: string): void
}

/**
 * Shape of template constructor
 */
export interface TemplateConstructorContract
  extends MacroableConstructorContract<TemplateContract> {
  new (
    compiler: CompilerContract,
    globals: any,
    locals: any,
    processor: ProcessorContract
  ): TemplateContract
}

/**
 * The tag must have a tagName along with other properties
 * required by lexer and parser
 */
export interface TagContract extends ParserTagDefinitionContract {
  tagName: string
  boot?(template: TemplateConstructorContract): void
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
  enabled: boolean
  get(templatePath: string): undefined | LoaderTemplate
  set(templatePath: string, compiledOutput: LoaderTemplate): void
  has(templatePath: string): boolean
  delete(templatePath: string): void
}

/**
 * Compiler constructor options
 */
export type CompilerOptions = {
  cache?: boolean
  async?: boolean
}

/**
 * Shape of the compiler
 */
export interface CompilerContract {
  cacheManager: CacheManagerContract
  async: boolean
  claimTag(fn: ClaimTagFn): this
  compile(templatePath: string, localVariables?: string[]): LoaderTemplate
  tokenize(templatePath: string, parser?: Parser): Token[]

  /**
   * Compile the raw string as a template
   */
  compileRaw(contents: string, templatePath?: string): LoaderTemplate

  /**
   * Tokenize the raw string as a template
   */
  tokenizeRaw(contents: string, templatePath?: string, parser?: Parser): Token[]
}

/**
 * Shape of the props class passed to the components
 */
export interface PropsContract {
  /**
   * Find if a key exists inside the props
   */
  has(key: string): boolean

  /**
   * Return values for only the given keys
   */
  only(keys: string[]): { [key: string]: any }

  /**
   * Return values except the given keys
   */
  except(keys: string[]): { [key: string]: any }

  /**
   * Serialize all props to a string of HTML attributes
   */
  serialize(mergeProps?: any): { value: string }

  /**
   * Serialize only the given keys to a string of HTML attributes
   */
  serializeOnly(keys: string[], mergeProps?: any): { value: string }

  /**
   * Serialize except the given keys to a string of HTML attributes
   */
  serializeExcept(keys: string[], mergeProps?: any): { value: string }
}

/**
 * Shape of the template contract
 */
export interface TemplateContract {
  /**
   * Compiles partial
   */
  compilePartial(templatePath: string, ...localVariables: string[]): Function

  /**
   * Compiles a component
   */
  compileComponent(templatePath: string, ...localVariables: string[]): string

  /**
   * Returns the state for a component
   */
  getComponentState(
    props: { [key: string]: any },
    slots: { [key: string]: any },
    caller: { filename: string; line: number; col: number }
  ): {
    $props: PropsContract & { [key: string]: any }
    $slots: { [key: string]: any }
    $caller: { filename: string; line: number; col: number }
  }

  /**
   * Renders a template to a string
   */
  render<T extends Promise<string> | string>(template: string, state: any): T
  renderRaw<T extends Promise<string> | string>(
    contents: string,
    state: any,
    templatePath?: string
  ): T

  /**
   * Escape input
   */
  escape(input: any): string

  /**
   * Rethrow exceptions by pointing back to edge source file and line number
   */
  reThrow(error: any, filename: string, line: number): never
}

/**
 * Shape of the renderer that renders the edge templates
 */
export interface EdgeRendererContract {
  /**
   * Share state with the template and its partials and component
   */
  share(locals: any): this

  /**
   * Render a template asynchronously
   */
  render(templatePath: string, state?: any): Promise<string>
  renderRaw(contents: string, state?: any, templatePath?: string): Promise<string>

  /**
   * Render a template synchronously
   */
  renderSync(templatePath: string, state?: any): string
  renderRawSync(contents: string, state?: any, templatePath?: string): string
}

/**
 * The processor is used to execute process functions for different
 * lifecycles
 */
export interface ProcessorContract {
  /**
   * Hook into the raw text to modify its contents. Make sure to return the
   * new string back or return "void" in case no modifications have been
   * performed
   */
  process(event: 'raw', handler: (data: { raw: string; path: string }) => string | void): this

  /**
   * Hook into the tag node to modify its properties
   */
  process(event: 'tag', handler: (data: { tag: TagToken; path: string }) => void): this

  /**
   * Hook into the compiled template to modify its contents. Make sure to return the
   * new string back or return "void" in case no modifications have been
   * performed
   */
  process(
    event: 'compiled',
    handler: (data: { compiled: string; path: string }) => string | void
  ): this

  /**
   * Hook into the compiled output to modify its contents. Make sure to return the
   * new string back or return "void" in case no modifications have been
   * performed
   */
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
export interface EdgeContract {
  /**
   * Loader for loading templates. You can also define a custom loader when creating
   * a new instance of edge
   */
  loader: LoaderContract

  /**
   * Compiler to be used for compiling synchronously
   */
  compiler: CompilerContract

  /**
   * Compiler to be used for compiling asynchronously
   */
  asyncCompiler: CompilerContract

  /**
   * Processor reference to hook into the compile and the rendering
   * phase of templates
   */
  processor: ProcessorContract

  /**
   * Set of registered globals. One can define custom globals using `edge.global`
   * method
   */
  GLOBALS: { [key: string]: any }

  /**
   * A custom set of registered tags. One can define a custom tag using `edge.registerTag`
   * method
   */
  tags: { [name: string]: TagContract }

  /**
   * Register a plugin. Plugins are lazily invoked just before the views are rendered. This
   * ensures that plugins will receive a fully configured edge instance.
   *
   * Also plugins are invoked only once. Unless, the `options.recurring` value is set
   */
  use<T extends any>(
    pluginFn: (edge: this, firstRun: boolean, options: T) => void,
    options?: T
  ): this

  /**
   * Register a custom tag
   */
  registerTag(tag: TagContract): this

  /**
   * Register an inline template
   */
  registerTemplate(templatePath: string, contents: LoaderTemplate): this

  /**
   * Remove the template registered using the "registerTemplate" method
   */
  removeTemplate(templatePath: string): this

  /**
   * Register a global value
   */
  global(key: string, value: any): this

  /**
   * Mount/disk
   */
  mount(diskName: string): this
  mount(diskName: string, dirPath: string): this

  /**
   * Unmount disk
   */
  unmount(diskName: string): this

  /**
   * Get a renderer instance to render templates
   */
  getRenderer(): EdgeRendererContract

  /**
   * Creates a renderer instances and shares the locals with it
   */
  share(locals: any): EdgeRendererContract

  /**
   * Render a template asynchronously
   */
  render(templatePath: string, state?: any): Promise<string>
  renderRaw(contents: string, state?: any, templatePath?: string): Promise<string>

  /**
   * Render a template synchronously
   */
  renderSync(templatePath: string, state?: any): string
  renderRawSync(contents: string, state?: any, templatePath?: string): string
}

/**
 * Required for someone creating custom tags
 */
export type EdgeBufferContract = EdgeBuffer
export type ParserContract = Parser
export type TagTokenContract = TagToken
export { ClaimTagFn }
