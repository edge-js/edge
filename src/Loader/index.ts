/**
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { readFileSync } from 'fs'
import requireUncached from 'import-fresh'
import { join, isAbsolute, extname, sep } from 'path'
import { Exception, esmResolver } from '@poppinss/utils'
import { LoaderContract, LoaderTemplate } from '../Contracts'

/**
 * The job of a loader is to load the template and it's presenter for a given path.
 * The base loader (shipped with edge) looks for files on the file-system and
 * reads them synchronously.
 *
 * You are free to define your own loaders that implements the [[LoaderContract]] interface.
 */
export class Loader implements LoaderContract {
  /**
   * List of mounted directories
   */
  private mountedDirs: Map<string, string> = new Map()

  /**
   * List of pre-registered (in-memory) templates
   */
  private preRegistered: Map<string, LoaderTemplate> = new Map()

  /**
   * Attempts to load the presenter for a given template. If presenter doesn't exists, it
   * will swallow the error.
   *
   * Also this method will **bypass the `require` cache**, since in production compiled templates
   * and their presenters are cached anyways.
   */
  private getPresenterForTemplate (templatePath: string): LoaderTemplate['Presenter'] | undefined {
    const presenterPath = templatePath
      .replace(/^\w/, c => c.toUpperCase())
      .replace(extname(templatePath), '.presenter.js')

    try {
      return esmResolver(requireUncached(presenterPath)) as LoaderTemplate['Presenter']
    } catch (error) {
      if (['ENOENT', 'MODULE_NOT_FOUND'].indexOf(error.code) === -1) {
        throw error
      }
    }
  }

  /**
   * Reads the content of a template from the disk. An exception is raised
   * when file is missing or if `readFileSync` returns an error.
   */
  private readTemplateContents (absPath: string): string {
    try {
      return readFileSync(absPath, 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Exception(
          `Cannot resolve "${absPath}". Make sure the file exists`,
          500,
          'E_MISSING_TEMPLATE_FILE',
        )
      } else {
        throw error
      }
    }
  }

  /**
   * Extracts the disk name and the template name from the template
   * path expression.
   *
   * If `diskName` is missing, it will be set to `default`.
   *
   * ```
   * extractDiskAndTemplateName('users::list')
   * // returns ['users', 'list.edge']
   *
   * extractDiskAndTemplateName('list')
   * // returns ['default', 'list.edge']
   * ```
   */
  private extractDiskAndTemplateName (templatePath: string): [string, string] {
    let [disk, ...rest] = templatePath.split('::')

    if (!rest.length) {
      rest = [disk]
      disk = 'default'
    }

    const [template, ext] = rest.join('::').split('.edge')
    return [disk, `${template.replace(/\./, sep)}.${ext || 'edge'}`]
  }

  /**
   * Returns an object of mounted directories with their public
   * names.
   *
   * ```js
   * loader.mounted
   * // output
   *
   * {
   *   default: '/users/virk/code/app/views',
   *   foo: '/users/virk/code/app/foo',
   * }
   * ```
   */
  public get mounted (): { [key: string]: string } {
    return Array.from(this.mountedDirs).reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {})
  }

  /**
   * Mount a directory with a name for resolving views. If name is set
   * to `default`, then you can resolve views without prefixing the
   * disk name.
   *
   * ```js
   * loader.mount('default', join(__dirname, 'views'))
   *
   * // mount a named disk
   * loader.mount('admin', join(__dirname, 'admin/views'))
   * ```
   */
  public mount (diskName: string, dirPath: string): void {
    this.mountedDirs.set(diskName, dirPath)
  }

  /**
   * Remove the previously mounted dir.
   *
   * ```js
   * loader.unmount('default')
   * ```
   */
  public unmount (diskName: string): void {
    this.mountedDirs.delete(diskName)
  }

  /**
   * Make path to a given template. The paths are resolved from the root
   * of the mounted directory.
   *
   * ```js
   * loader.makePath('welcome') // returns {diskRootPath}/welcome.edge
   * loader.makePath('admin::welcome') // returns {adminRootPath}/welcome.edge
   * loader.makePath('users.list') // returns {diskRootPath}/users/list.edge
   * ```
   *
   * @throws Error if disk is not mounted and attempting to make path for it.
   */
  public makePath (templatePath: string): string {
    /**
     * Return the template path as it is, when it is registered
     * dynamically
     */
    if (this.preRegistered.has(templatePath)) {
      return templatePath
    }

    /**
     * Return absolute path as it is
     */
    if (isAbsolute(templatePath)) {
      return templatePath
    }

    /**
     * Extract disk name and template path from the expression
     */
    const [ diskName, template ] = this.extractDiskAndTemplateName(templatePath)

    /**
     * Raise exception when disk name is not registered
     */
    const mountedDir = this.mountedDirs.get(diskName)
    if (!mountedDir) {
      throw new Exception(`"${diskName}" namespace is not mounted`, 500, 'E_UNMOUNTED_DISK_NAME')
    }

    return join(mountedDir, template)
  }

  /**
   * Resolves the template from the disk, optionally loads the presenter too. The presenter
   * resolution is based on the convention and resolved from the same directory
   * as the template.
   *
   * ## Presenter convention
   * - View name - welcome.edge
   * - Presenter name - Welcome.presenter.js
   *
   * ```js
   * loader.resolve('welcome', true)
   *
   * // output
   * {
   *   template: `<h1> Template content </h1>`,
   *   Presenter: class Presenter | undefined
   * }
   * ```
   */
  public resolve (templatePath: string, withPresenter: boolean): LoaderTemplate {
    /**
     * Return from pre-registered one's if exists
     */
    if (this.preRegistered.has(templatePath)) {
      const contents = this.preRegistered.get(templatePath)
      return withPresenter ? contents! : { template: contents!.template }
    }

    /**
     * Make absolute to the file on the disk
     */
    templatePath = isAbsolute(templatePath) ? templatePath : this.makePath(templatePath)

    return {
      template: this.readTemplateContents(templatePath),
      Presenter: withPresenter ? this.getPresenterForTemplate(templatePath) : undefined,
    }
  }

  /**
   * Register in memory template and Presenter for a given path. This is super helpful
   * when distributing components.
   *
   * ```js
   * loader.register('welcome', {
   *   template: '<h1> Template content </h1>',
   *   Presenter: class Presenter {
   *     constructor (state) {
   *       this.state = state
   *     }
   *   }
   * })
   * ```
   *
   * @throws Error if template content is empty.
   */
  public register (templatePath: string, contents: LoaderTemplate) {
    /**
     * Ensure template content is defined as a string
     */
    if (typeof (contents.template) !== 'string') {
      throw new Exception(
        'Make sure to define the template content as a string',
        500,
        'E_MISSING_TEMPLATE_CONTENTS',
      )
    }

    /**
     * Do not overwrite existing template with same template path
     */
    if (this.preRegistered.has(templatePath)) {
      throw new Exception(
        `Cannot override previously registered "${templatePath}" template`,
        500,
        'E_DUPLICATE_TEMPLATE_PATH',
      )
    }

    this.preRegistered.set(templatePath, contents)
  }
}
