/**
 * @module edge
 */

/**
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ParseTagDefininationContract } from 'edge-parser'

/**
 * The shape in which the loader must resolve the template
 */
export type LoaderTemplate = {
  template: string,
  Presenter?: {
    new (state: any): any,
  },
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
   * Save disk name and dirPath to resolve views
   */
  mount (diskName: string, dirPath: string): void

  /**
   * Remove disk from the previously saved paths
   */
  unmount (diskName: string): void

  /**
   * Resolve template contents and optionally the Presenter
   */
  resolve (templatePath: string, withPresenter: boolean): LoaderTemplate

  /**
   * Make absolute path to a template
   */
  makePath (templatePath: string): string

  /**
   * Register in memory template and presenter
   */
  register (templatePath: string, contents: LoaderTemplate): void
}

/**
 * The final tag must have a tagName along with other properties
 * required by lexer and parser
 */
export interface TagContract extends ParseTagDefininationContract {
  tagName: string
}

/**
 * Shape of required tags
 */
export type Tags = {
  [tagName: string]: TagContract,
}
