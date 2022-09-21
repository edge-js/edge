/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Tags from '../Tags'
import { Loader } from '../Loader'
import { Compiler } from '../Compiler'
import { Template } from '../Template'
import { Processor } from '../Processor'
import { EdgeRenderer } from '../Renderer'

import {
  TagContract,
  EdgeOptions,
  EdgeContract,
  LoaderTemplate,
  CompilerOptions,
  EdgeRendererContract,
} from '../Contracts'

/**
 * Exposes the API to render templates, register custom tags and globals
 */
export class Edge implements EdgeContract {
  private executedPlugins: boolean = false

  /**
   * Options passed to the compiler instance
   */
  private compilerOptions: CompilerOptions = {
    cache: !!this.options.cache,
    async: false,
  }

  /**
   * Options passed to the async compiler instance
   */
  private asyncCompilerOptions: CompilerOptions = {
    cache: !!this.options.cache,
    async: true,
  }

  /**
   * An array of registered plugins
   */
  private plugins: {
    fn: (edge: Edge, firstRun: boolean, options?: any) => void
    options?: any
  }[] = []

  /**
   * Array of registered renderer hooks
   */
  private renderCallbacks: ((renderer: EdgeRendererContract) => void)[] = []

  /**
   * Reference to the registered processor handlers
   */
  public processor = new Processor()

  /**
   * Globals are shared with all rendered templates
   */
  public GLOBALS: { [key: string]: any } = {}

  /**
   * List of registered tags. Adding new tags will only impact
   * this list
   */
  public tags: { [name: string]: TagContract } = {}

  /**
   * The loader to load templates. A loader can read and return
   * templates from anywhere. The default loader reads files
   * from the disk
   */
  public loader = this.options.loader || new Loader()

  /**
   * The underlying compiler in use
   */
  public compiler = new Compiler(this.loader, this.tags, this.processor, this.compilerOptions)

  /**
   * The underlying compiler in use
   */
  public asyncCompiler = new Compiler(
    this.loader,
    this.tags,
    this.processor,
    this.asyncCompilerOptions
  )

  constructor(private options: EdgeOptions = {}) {
    Object.keys(Tags).forEach((name) => this.registerTag(Tags[name]))
  }

  /**
   * Execute plugins. Since plugins are meant to be called only
   * once we empty out the array after first call
   */
  private executePlugins() {
    if (this.executedPlugins) {
      this.plugins.forEach(({ fn, options }) => {
        if (options && options.recurring) {
          fn(this, false, options)
        }
      })
    } else {
      this.executedPlugins = true
      this.plugins.forEach(({ fn, options }) => {
        fn(this, true, options)
      })
    }
  }

  /**
   * Register a plugin. Plugin functions are called once just before
   * an attempt to render a view is made.
   */
  public use<T extends any>(
    pluginFn: (edge: this, firstRun: boolean, options: T) => void,
    options?: T
  ): this {
    this.plugins.push({
      fn: pluginFn,
      options,
    })
    return this
  }

  /**
   * Mount named directory to use views. Later you can reference
   * the views from a named disk as follows.
   *
   * ```
   * edge.mount('admin', join(__dirname, 'admin'))
   *
   * edge.render('admin::filename')
   * ```
   */
  public mount(diskName: string, dirPath?: string): this {
    if (!dirPath) {
      dirPath = diskName
      diskName = 'default'
    }

    this.loader.mount(diskName, dirPath)
    return this
  }

  /**
   * Un Mount a disk from the loader.
   *
   * ```js
   * edge.unmount('admin')
   * ```
   */
  public unmount(diskName: string): this {
    this.loader.unmount(diskName)
    return this
  }

  /**
   * Add a new global to the edge globals. The globals are available
   * to all the templates.
   *
   * ```js
   * edge.global('username', 'virk')
   * edge.global('time', () => new Date().getTime())
   * ```
   */
  public global(name: string, value: any): this {
    this.GLOBALS[name] = value
    return this
  }

  /**
   * Add a new tag to the tags list.
   *
   * ```ts
   * edge.registerTag('svg', {
   *   block: false,
   *   seekable: true,
   *
   *   compile (parser, buffer, token) {
   *     const fileName = token.properties.jsArg.trim()
   *     buffer.writeRaw(fs.readFileSync(__dirname, 'assets', `${fileName}.svg`), 'utf-8')
   *   }
   * })
   * ```
   */
  public registerTag(tag: TagContract): this {
    if (typeof tag.boot === 'function') {
      tag.boot(Template)
    }

    this.tags[tag.tagName] = tag
    return this
  }

  /**
   * Register an in-memory template.
   *
   * ```ts
   * edge.registerTemplate('button', {
   *   template: `<button class="{{ this.type || 'primary' }}">
   *     @!yield($slots.main())
   *   </button>`,
   * })
   * ```
   *
   * Later you can use this template
   *
   * ```edge
   * @component('button', type = 'primary')
   *   Get started
   * @endcomponent
   * ```
   */
  public registerTemplate(templatePath: string, contents: LoaderTemplate): this {
    this.loader.register(templatePath, contents)
    return this
  }

  /**
   * Remove the template registered using the "registerTemplate" method
   */
  public removeTemplate(templatePath: string): this {
    this.loader.remove(templatePath)
    this.compiler.cacheManager.delete(templatePath)
    this.asyncCompiler.cacheManager.delete(templatePath)
    return this
  }

  /**
   * Get access to the underlying template renderer. Each render call
   * to edge results in creating an isolated renderer instance.
   */
  public onRender(callback: (renderer: EdgeRendererContract) => void): this {
    this.renderCallbacks.push(callback)
    return this
  }

  /**
   * Returns a new instance of edge. The instance
   * can be used to define locals.
   */
  public getRenderer(): EdgeRendererContract {
    this.executePlugins()

    const renderer = new EdgeRenderer(
      this.compiler,
      this.asyncCompiler,
      this.GLOBALS,
      this.processor
    )

    this.renderCallbacks.forEach((callback) => callback(renderer))
    return renderer
  }

  /**
   * Render a template with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  public render(templatePath: string, state?: any): Promise<string> {
    return this.getRenderer().render(templatePath, state)
  }

  /**
   * Render a template asynchronously with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  public renderSync(templatePath: string, state?: any): string {
    return this.getRenderer().renderSync(templatePath, state)
  }

  /**
   * Render a template with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  public renderRaw(contents: string, state?: any, templatePath?: string): Promise<string> {
    return this.getRenderer().renderRaw(contents, state, templatePath)
  }

  /**
   * Render a template asynchronously with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  public renderRawSync(templatePath: string, state?: any): string {
    return this.getRenderer().renderRawSync(templatePath, state)
  }

  /**
   * Share locals with the current view context.
   *
   * ```js
   * const view = edge.getRenderer()
   *
   * // local state for the current render
   * view.share({ foo: 'bar' })
   *
   * view.render('welcome')
   * ```
   */
  public share(data: any): EdgeRendererContract {
    return this.getRenderer().share(data)
  }
}
