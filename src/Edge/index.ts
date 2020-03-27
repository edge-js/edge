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
import { Context } from '../Context'
import { Compiler } from '../Compiler'
import { EdgeRenderer } from '../Renderer'

import {
  TagContract,
  EdgeOptions,
  EdgeContract,
  LoaderTemplate,
  EdgeRendererContract,
} from '../Contracts'

/**
 * Exposes the API to render templates, register custom tags and globals
 */
export class Edge implements EdgeContract {
  /**
   * Globals are shared with all rendered templates
   */
  private globals: any = {}

  /**
   * List of registered tags. Adding new tags will only impact
   * this list
   */
  private tags = {}

  /**
   * The loader to load templates. A loader can read and return
   * templates from anywhere. The default loader reads files
   * from the disk
   */
  public loader = this.options.loader || new Loader()

  /**
   * The underlying compiler in use
   */
  public compiler = new Compiler(this.loader, this.tags, !!this.options.cache)

  constructor (private options: EdgeOptions = {}) {
    Object.keys(Tags).forEach((name) => this.registerTag(Tags[name]))
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
  public mount (diskName: string, dirPath?: string): this {
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
  public unmount (diskName: string): this {
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
  public global (name: string, value: any): this {
    this.globals[name] = value
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
  public registerTag (tag: TagContract): this {
    if (typeof (tag.run) === 'function') {
      tag.run(Context)
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
  public registerTemplate (templatePath: string, contents: LoaderTemplate): this {
    this.loader.register(templatePath, contents)
    return this
  }

  /**
   * Render a template with optional state
   *
   * ```ts
   * edge.render('welcome', { greeting: 'Hello world' })
   * ```
   */
  public render (templatePath: string, state?: any): string {
    return this.getRenderer().render(templatePath, state)
  }

  /**
   * Returns a new instance of edge. The instance
   * can be used to define locals.
   */
  public getRenderer (): EdgeRendererContract {
    return new EdgeRenderer(this.compiler, this.globals)
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
  public share (data: any): EdgeRendererContract {
    return this.getRenderer().share(data)
  }
}
