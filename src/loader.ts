/**
 * edge
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { slash } from '@poppinss/utils'
import { fileURLToPath } from 'node:url'
import string from '@poppinss/utils/string'
import { join, isAbsolute } from 'node:path'
import readdirSync from 'fs-readdir-recursive'
import { existsSync, readFileSync } from 'node:fs'
import type { ComponentsTree, LoaderContract, LoaderTemplate } from './types.js'

/**
 * The job of a loader is to load the template from a given path.
 * The base loader (shipped with edge) looks for files on the
 * file-system and reads them synchronously.
 *
 * You are free to define your own loaders that implements the [[LoaderContract]] interface.
 */
export class Loader implements LoaderContract {
  /**
   * List of mounted directories
   */
  #mountedDirs: Map<string, string> = new Map()

  /**
   * List of pre-registered (in-memory) templates
   */
  #preRegistered: Map<string, LoaderTemplate> = new Map()

  /**
   * Reads the content of a template from the disk. An exception is raised
   * when file is missing or if `readFileSync` returns an error.
   */
  #readTemplateContents(absPath: string): string {
    try {
      return readFileSync(absPath, 'utf-8')
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Cannot resolve "${absPath}". Make sure the file exists`)
      } else {
        throw error
      }
    }
  }

  /**
   * Returns a list of components for a given disk
   */
  #getDiskComponents(diskName: string): ComponentsTree[0]['components'] {
    const componentsDirName = 'components'
    const diskBasePath = this.#mountedDirs.get(diskName)!
    let files =
      diskName === 'default'
        ? Array.from(this.#preRegistered.keys()).map((template) => {
            return {
              fileName: template,
              componentPath: template,
            }
          })
        : []

    /**
     * Read disk files
     */
    if (existsSync(join(diskBasePath, componentsDirName))) {
      files = files.concat(
        readdirSync(join(diskBasePath, componentsDirName))
          .filter((file) => file.endsWith('.edge'))
          .map((template) => {
            const fileName = slash(template).replace(/\.edge$/, '')
            return {
              fileName,
              componentPath: `${componentsDirName}/${fileName}`,
            }
          })
      )
    }

    return files.map(({ fileName, componentPath }) => {
      const tagName = fileName
        .split('/')
        .filter((segment, index) => {
          return index === 0 || segment !== 'index'
        })
        .map((segment) => string.camelCase(segment))
        .join('.')

      return {
        componentName: diskName !== 'default' ? `${diskName}::${componentPath}` : componentPath,
        tagName: diskName !== 'default' ? `${diskName}.${tagName}` : tagName,
      }
    })
  }

  /**
   * Returns a list of templates for a given disk
   */
  #getDiskTemplates(diskName: string): string[] {
    const diskBasePath = this.#mountedDirs.get(diskName)!
    let files = diskName === 'default' ? Array.from(this.#preRegistered.keys()) : []

    if (existsSync(diskBasePath)) {
      files = files.concat(readdirSync(join(diskBasePath)).filter((file) => file.endsWith('.edge')))
    }

    return files.map((file) => {
      const fileName = slash(file).replace(/\.edge$/, '')
      return diskName !== 'default' ? `${diskName}::${fileName}` : fileName
    })
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
  #extractDiskAndTemplateName(templatePath: string): [string, string] {
    let [disk, ...rest] = templatePath.split('::')

    if (!rest.length) {
      rest = [disk]
      disk = 'default'
    }

    let [template, ext] = rest.join('::').split('.edge')
    return [disk, `${template}.${ext || 'edge'}`]
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
  get mounted(): { [key: string]: string } {
    return Array.from(this.#mountedDirs).reduce(
      (obj, [key, value]) => {
        obj[key] = value
        return obj
      },
      {} as Record<string, string>
    )
  }

  /**
   * Returns an object of templates registered as a raw string
   *
   * ```js
   * loader.templates
   * // output
   *
   * {
   *   'form.label': { template: 'Template contents' }
   * }
   * ```
   */
  get templates(): { [templatePath: string]: LoaderTemplate } {
    return Array.from(this.#preRegistered).reduce(
      (obj, [key, value]) => {
        obj[key] = value
        return obj
      },
      {} as Record<string, LoaderTemplate>
    )
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
  mount(diskName: string, dirPath: string | URL): void {
    this.#mountedDirs.set(diskName, typeof dirPath === 'string' ? dirPath : fileURLToPath(dirPath))
  }

  /**
   * Remove the previously mounted dir.
   *
   * ```js
   * loader.unmount('default')
   * ```
   */
  unmount(diskName: string): void {
    this.#mountedDirs.delete(diskName)
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
  makePath(templatePath: string): string {
    /**
     * Return the template path as it is, when it is registered
     * dynamically
     */
    if (this.#preRegistered.has(templatePath)) {
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
    const [diskName, template] = this.#extractDiskAndTemplateName(templatePath)

    /**
     * Raise exception when disk name is not registered
     */
    const mountedDir = this.#mountedDirs.get(diskName)
    if (!mountedDir) {
      throw new Error(`"${diskName}" namespace is not mounted`)
    }

    return join(mountedDir, template)
  }

  /**
   * Resolves the template by reading its contents from the disk
   *
   * ```js
   * loader.resolve('welcome', true)
   *
   * // output
   * {
   *   template: `<h1> Template content </h1>`,
   * }
   * ```
   */
  resolve(templatePath: string): LoaderTemplate {
    /**
     * Return from pre-registered one's if exists
     */
    if (this.#preRegistered.has(templatePath)) {
      return this.#preRegistered.get(templatePath)!
    }

    /**
     * Make absolute to the file on the disk
     */
    templatePath = isAbsolute(templatePath) ? templatePath : this.makePath(templatePath)

    return {
      template: this.#readTemplateContents(templatePath),
    }
  }

  /**
   * Register in memory template for a given path. This is super helpful
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
  register(templatePath: string, contents: LoaderTemplate) {
    /**
     * Ensure template content is defined as a string
     */
    if (typeof contents.template !== 'string') {
      throw new Error('Make sure to define the template content as a string')
    }

    /**
     * Do not overwrite existing template with same template path
     */
    if (this.#preRegistered.has(templatePath)) {
      throw new Error(`Cannot override previously registered "${templatePath}" template`)
    }

    this.#preRegistered.set(templatePath, contents)
  }

  /**
   * Remove registered template
   */
  remove(templatePath: string) {
    this.#preRegistered.delete(templatePath)
  }

  /**
   * Returns a list of components from all the disks. We assume
   * the components are stored within the components directory.
   *
   * Also, we treat all in-memory templates as components.
   *
   * The return path is same the path you will pass to the `@component`
   * tag.
   */
  listComponents(): ComponentsTree {
    const diskNames = [...this.#mountedDirs.keys()]
    return diskNames.map((diskName) => {
      return {
        diskName,
        components: this.#getDiskComponents(diskName),
      }
    })
  }

  /**
   * Returns a list of templates from all the disks and in-memory
   * templates as well
   */
  listTemplates(): { diskName: string; templates: string[] }[] {
    const diskNames = [...this.#mountedDirs.keys()]
    return diskNames.map((diskName) => {
      return {
        diskName,
        templates: this.#getDiskTemplates(diskName),
      }
    })
  }
}
