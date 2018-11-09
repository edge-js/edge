/**
 * @module main
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { merge } from 'lodash'
import * as Tags from '../Tags'
import { Compiler } from '../Compiler'
import { Loader } from '../Loader'
import { ILoaderConstructor, ILoader, ITag, IPresenterConstructor } from '../Contracts'
import { Template } from '../Template'
import { Context } from '../Context'
import * as Debug from 'debug'

const debug = Debug('edge')

let loader: null | ILoader = null
let compiler: null | Compiler = null

type configOptions = {
  Loader?: ILoaderConstructor,
  cache?: boolean,
}

/**
 * This class is the main interface to configure and render
 * templates.
 *
 * ## Basic Setup
 *
 * ```js
 * import edge from 'edge.js'
 *
 * edge.configure({
 *   cache: boolean,
 *   loader: CustomLoaderIfAny
 * })
 * ```
 *
 * ```js
 * edge.mount(join(__dirname, 'views'))
 *
 * // or named disk
 * edge.mount('admin', join(__dirname, 'admin/views'))
 * ```
 */
export class Edge {
  private static globals: any = {}
  private locals: any = {}

  /**
   * Returns the instance of loader in use. Make use of
   * `configure` method to define a custom loader
   */
  public static get loader (): ILoader {
    return loader!
  }

  /**
   * Returns the instance of compiler in use.
   */
  public static get compiler (): Compiler {
    return compiler!
  }

  /**
   * Configure edge with an optional custom loader and toggle the
   * caching behavior.
   *
   * ```js
   * edge.configure({
   *   cache: process.env.NODE_ENV === 'production'
   * })
   * ```
   */
  public static configure (options: configOptions) {
    const edgeOptions = Object.assign({
      Loader: Loader,
      cache: false,
    }, options)

    debug('configure %o', edgeOptions)

    loader = new edgeOptions.Loader!()
    compiler = new Compiler(loader!, Tags, edgeOptions.cache)

    Object.keys(Tags).forEach((tag) => {
      debug('calling run method on %s', tag)
      if (typeof (Tags[tag].run) === 'function') {
        Tags[tag].run(Context)
      }
    })
  }

  public static mount (diskName: string, dirPath: string): void
  public static mount (dirPath: string): void

  /**
   * Mount a disk to the loader.
   *
   * ```js
   * edge.mount(join(__dirname, 'views'))
   *
   * // or named disk
   * edge.mount('admin', join(__dirname, 'admin/views'))
   * ```
   */
  public static mount (diskName: string, dirPath?: string): void {
    /* istanbul ignore else  */
    if (!this.compiler) {
      this.configure({})
    }

    if (!dirPath) {
      dirPath = diskName
      diskName = 'default'
    }

    loader!.mount(diskName, dirPath)
  }

  /**
   * Un Mount a disk from the loader.
   *
   * ```js
   * edge.unmount('admin')
   * ```
   */
  public static unmount (diskName: string): void {
    loader!.unmount(diskName)
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
  public static global (name: string, value: any): void {
    this.globals[name] = value
  }

  /**
   * Add a new tag to the tags list.
   */
  public static tag (tag: ITag) {
    debug('defining a new tag %s', tag.tagName)
    Tags[tag.tagName] = tag
  }

  /**
   * Register an in-memory template as a string. Check [loader.register](main.loader.html#register) for
   * more info.
   */
  public static register (templatePath: string, contents: { template: string, Presenter?: IPresenterConstructor }) {
    debug('registering dynamic template %s', templatePath)
    loader!.register(templatePath, contents)
  }

  /**
   * Shorthand to `new Edge().render()` or `Edge.newUp().render()`
   */
  public static render (templatePath: string, state: any): string {
    return new this().render(templatePath, state)
  }

  /**
   * Returns a new instance of edge. The instance
   * can be used to define locals.
   */
  public static newUp (): Edge {
    return new this()
  }

  /**
   * Clears registered globals, loader and
   * the compiler instance.
   */
  public static clear () {
    this.globals = {}
    loader = null
    compiler = null
  }

  /**
   * Render template with state. The `newUp` is helpful
   * when you want to pass locals to the
   * template
   *
   * ```js
   * edge.newUp().render('welcome', {})
   * ```
   */
  public render (templatePath: string, state: any = {}): string {
    const template = new Template(compiler!, (this.constructor as typeof Edge).globals, this.locals)
    return template.render(templatePath, state)
  }

  /**
   * Share locals with the current view context.
   *
   * ```js
   * const view = edge.newUp()
   *
   * // local state for the current render
   * view.share({ foo: 'bar' })
   *
   * view.render('welcome')
   * ```
   */
  public share (data: any): this {
    merge(this.locals, data)
    return this
  }
}
