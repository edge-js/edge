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

import * as Tags from '../Tags'
import { Loader } from '../Loader'
import { Compiler } from '../Compiler'
import { EdgeRenderer } from '../Renderer'

import {
  LoaderContract,
  TagContract,
  LoaderTemplate,
  EdgeContract,
  EdgeRendererContract,
} from '../Contracts'

export class Edge implements EdgeContract {
  /**
   * Globals are shared with all rendered templates
   */
  private _globals: any = {}

  /**
   * List of registered tags. Adding new tags will only impact
   * this list
   */
  private _tags = Object.assign({}, Tags)

  /**
   * The underlying compiler in use
   */
  public compiler = new Compiler(this.loader, this._tags, false)

  constructor (public loader: LoaderContract = new Loader()) {
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
  public mount (diskName: string, dirPath: string): this

  /**
   * Mount defaults views directory.
   *
   * ```
   * edge.mount(join(__dirname, 'admin'))
   * edge.render('filename')
   * ```
   */
  public mount (dirPath: string): this

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
    this._globals[name] = value
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
    this._tags[tag.tagName] = tag
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
    return new EdgeRenderer(this.compiler, this._globals)
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
