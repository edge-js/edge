/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { join, isAbsolute, extname } from 'path'
import { readFileSync } from 'fs'
import * as requireUncached from 'require-uncached'

import { ILoader, IPresenterConstructor } from '../Contracts'
import { extractDiskAndTemplateName } from '../utils'

export class Loader implements ILoader {
  private mountedDirs: Map<string, string> = new Map()
  private preRegistered: Map<string, { template: string, Presenter?: IPresenterConstructor }> = new Map()

  /**
   * Returns an object of mounted directories with their public
   * names
   */
  public get mounted (): object {
    return Array.from(this.mountedDirs).reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})
  }

  /**
   * Mount a directory for resolving views
   */
  public mount (diskName: string, dirPath: string): void {
    this.mountedDirs.set(diskName, dirPath)
  }

  /**
   * Remove directory from the list of directories
   * for resolving views
   */
  public unmount (diskName: string): void {
    this.mountedDirs.delete(diskName)
  }

  /**
   * Makes the path to the template file. This method will extract the
   * disk name from the templatePath as follows.
   *
   * @example
   * ```
   * loader.makePath('index')
   * loader.makePath('users::index')
   * ```
   */
  public makePath (templatePath: string): string {
    const [diskName, template] = extractDiskAndTemplateName(templatePath)

    const mountedDir = this.mountedDirs.get(diskName)
    if (!mountedDir) {
      throw new Error(`Attempting to resolve ${template} template for unmounted ${diskName} location`)
    }

    return join(mountedDir, template)
  }

  /**
   * Resolves a template from disk and returns it as a string
   */
  public resolve (templatePath: string, withPresenter: boolean): { template: string, Presenter?: IPresenterConstructor } {
    try {
      templatePath = isAbsolute(templatePath) ? templatePath : this.makePath(templatePath)

      /**
       * Return from pre-registered one's if exists
       */
      if (this.preRegistered.get(templatePath)) {
        const contents = this.preRegistered.get(templatePath)
        return withPresenter ? contents! : { template: contents!.template }
      }

      const template = readFileSync(templatePath, 'utf-8')
      const Presenter = withPresenter ? this._getPresenterForTemplate(templatePath) : undefined
      return { template, Presenter }
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Cannot resolve ${templatePath}. Make sure file exists.`)
      } else {
        throw error
      }
    }
  }

  /**
   * Register a template as a string
   */
  public register (templatePath: string, contents: { template: string, Presenter?: IPresenterConstructor }) {
    templatePath = isAbsolute(templatePath) ? templatePath : this.makePath(templatePath)

    if (!contents.template) {
      throw new Error('Make sure to define the template content for preRegistered template')
    }

    this.preRegistered.set(templatePath, contents)
  }

  /**
   * Attempts to conventionally load the presenter for a given template
   * using the same basePath.
   */
  private _getPresenterForTemplate (templatePath: string): IPresenterConstructor | undefined {
    try {
      return requireUncached(templatePath.replace(extname(templatePath), '.presenter.js'))
    } catch (error) {
      if (['ENOENT', 'MODULE_NOT_FOUND'].indexOf(error.code) === -1) {
        throw error
      }
    }
  }
}
