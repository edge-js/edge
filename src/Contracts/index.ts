/**
 * @module main
 */

/**
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Token } from 'edge-lexer'
import { ParseTagDefininationContract } from 'edge-parser'

export type LoaderTemplate = {
  template: string,
  Presenter?: PresenterConstructorContract,
}

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
 * Compiler
 */
export interface CompilerContract {
  /**
   * Returns an array of edge-lexer tokens
   */
  generateTokens (templatePath: string): Token[]

  /**
   * Compile template to a function string
   */
  compile (templatePath: string, inline: boolean): LoaderTemplate
}

/**
 * Presenter
 */
export interface PresenterConstructorContract {
  new (state: any): PresenterContract
}

export interface PresenterContract {
  state: any
}

/**
 * Tags
 */
export interface TagContract extends ParseTagDefininationContract {
  tagName: string
}

export type Tags = {
  [key: string]: TagContract,
}
