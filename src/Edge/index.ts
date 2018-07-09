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
import { ILoaderConstructor, ILoader, ITag } from '../Contracts'
import { Template } from '../Template'
import { Context } from '../Context'

let loader: null | ILoader = null
let compiler: null | Compiler = null

Object.keys(Tags).forEach((tag) => {
  if (typeof (Tags[tag].run) === 'function') {
    Tags[tag].run(Context)
  }
})

type configOptions = {
  Loader?: ILoaderConstructor,
  cache?: boolean,
}

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
   * Configure edge
   */
  public static configure (options: configOptions) {
    loader = new (options.Loader || Loader)()
    compiler = new Compiler(loader!, Tags, !!options.cache)
  }

  public static mount (diskName: string, dirPath: string): void
  public static mount (dirPath: string): void

  /**
   * Mount a disk to the loader
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
   * Un Mount a disk from the loader
   */
  public static unmount (diskName: string): void {
    loader!.unmount(diskName)
  }

  /**
   * Add a new global to the edge globals
   */
  public static global (name: string, value: any): void {
    this.globals[name] = value
  }

  /**
   * Add a new tag to the tags list
   */
  public static tag (Tag: ITag) {
    Tags[Tag.tagName] = Tag
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
   * the compiler instance
   */
  public static clear () {
    this.globals = {}
    loader = null
    compiler = null
  }

  /**
   * Render template with state
   */
  public render (templatePath: string, state: any): string {
    const template = new Template(compiler!, (this.constructor as typeof Edge).globals, this.locals)
    return template.render(templatePath, state)
  }

  /**
   * Share locals with the current view context
   */
  public share (data: any): this {
    merge(this.locals, data)
    return this
  }
}
