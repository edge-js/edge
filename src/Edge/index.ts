/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as Tags from '../tags/index.js'
import { Loader } from '../loader/index.js'
import { Compiler } from '../compiler/index.js'
import { Template } from '../template/index.js'
import { Processor } from '../processor/index.js'
import { EdgeRenderer } from '../renderer/index.js'

import {
  TagContract,
  EdgeOptions,
  EdgeContract,
  LoaderTemplate,
  EdgeRendererContract,
  LoaderContract,
} from '../types.js'

/**
 * Exposes the API to render templates, register custom tags and globals
 */
export class Edge implements EdgeContract {
  #executedPlugins = false

  /**
   * An array of registered plugins
   */
  #plugins: {
    fn: (edge: Edge, firstRun: boolean, options?: any) => void
    options?: any
  }[] = []

  /**
   * Array of registered renderer hooks
   */
  #renderCallbacks: ((renderer: EdgeRendererContract) => void)[] = []

  /**
   * Reference to the registered processor handlers
   */
  processor = new Processor()

  /**
   * Globals are shared with all rendered templates
   */
  GLOBALS: { [key: string]: any } = {}

  /**
   * List of registered tags. Adding new tags will only impact
   * this list
   */
  tags: { [name: string]: TagContract } = {}

  /**
   * The loader to load templates. A loader can read and return
   * templates from anywhere. The default loader reads files
   * from the disk
   */
  loader: LoaderContract

  /**
   * The underlying compiler in use
   */
  compiler: Compiler

  /**
   * The underlying compiler in use
   */
  asyncCompiler: Compiler

  constructor(options: EdgeOptions = {}) {
    this.loader = options.loader || new Loader()

    this.compiler = new Compiler(this.loader, this.tags, this.processor, {
      cache: !!options.cache,
      async: false,
    })

    this.asyncCompiler = new Compiler(this.loader, this.tags, this.processor, {
      cache: !!options.cache,
      async: true,
    })

    // @ts-ignore
    Object.keys(Tags).forEach((name) => this.registerTag(Tags[name]))
  }

  /**
   * Execute plugins. Since plugins are meant to be called only
   * once we empty out the array after first call
   */
  private executePlugins() {
    if (this.#executedPlugins) {
      this.#plugins.forEach(({ fn, options }) => {
        if (options && options.recurring) {
          fn(this, false, options)
        }
      })
    } else {
      this.#executedPlugins = true
      this.#plugins.forEach(({ fn, options }) => {
        fn(this, true, options)
      })
    }
  }

  /**
   * Register a plugin. Plugin functions are called once just before
   * an attempt to render a view is made.
   */
  use<T extends any>(
    pluginFn: (edge: this, firstRun: boolean, options: T) => void,
    options?: T
  ): this {
    this.#plugins.push({
      fn: pluginFn as any,
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
  mount(diskName: string, dirPath?: string): this {
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
  unmount(diskName: string): this {
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
  global(name: string, value: any): this {
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
  registerTag(tag: TagContract): this {
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
  registerTemplate(templatePath: string, contents: LoaderTemplate): this {
    this.loader.register(templatePath, contents)
    return this
  }

  /**
   * Remove the template registered using the "registerTemplate" method
   */
  removeTemplate(templatePath: string): this {
    this.loader.remove(templatePath)
    this.compiler.cacheManager.delete(templatePath)
    this.asyncCompiler.cacheManager.delete(templatePath)
    return this
  }

  /**
   * Get access to the underlying template renderer. Each render call
   * to edge results in creating an isolated renderer instance.
   */
  onRender(callback: (renderer: EdgeRendererContract) => void): this {
    this.#renderCallbacks.push(callback)
    return this
  }

  /**
   * Returns a new instance of edge. The instance
   * can be used to define locals.
   */
  getRenderer(): EdgeRendererContract {
    this.executePlugins()

    const renderer = new EdgeRenderer(
      this.compiler,
      this.asyncCompiler,
      this.GLOBALS,
      this.processor
    )

    this.#renderCallbacks.forEach((callback) => callback(renderer))
    return renderer
  }

  /**
   * Render a template with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  render(templatePath: string, state?: any): Promise<string> {
    return this.getRenderer().render(templatePath, state)
  }

  /**
   * Render a template asynchronously with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  renderSync(templatePath: string, state?: any): string {
    return this.getRenderer().renderSync(templatePath, state)
  }

  /**
   * Render a template with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  renderRaw(contents: string, state?: any, templatePath?: string): Promise<string> {
    return this.getRenderer().renderRaw(contents, state, templatePath)
  }

  /**
   * Render a template asynchronously with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  renderRawSync(templatePath: string, state?: any): string {
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
  share(data: any): EdgeRendererContract {
    return this.getRenderer().share(data)
  }
}
