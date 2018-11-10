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

import { ITag as BaseTag } from 'edge-parser/build/src/Contracts'
import { IToken } from 'edge-lexer/build/src/Contracts'

export type ILoaderTemplate = {
  template: string,
  Presenter?: IPresenterConstructor,
}

export interface ILoaderConstructor {
  new (): ILoader
}

export interface ILoader {
  mounted: { [key: string]: string }

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
  resolve (templatePath: string, withPresenter: boolean): ILoaderTemplate

  /**
   * Make absolute path to a template
   */
  makePath (templatePath: string): string

  /**
   * Register in memory template and presenter
   */
  register (templatePath: string, contents: ILoaderTemplate): void
}

export interface ICompiler {
  /**
   * Return an array of edge-lexer tokens
   */
  generateTokens (templatePath: string): IToken[]

  /**
   * Compile template to a function string
   */
  compile (templatePath: string, inline: boolean): ILoaderTemplate
}

export interface ITag extends BaseTag {
  tagName: string
}

export type Tags = {
  [key: string]: ITag,
}

export interface IPresenterConstructor {
  new (state: any): IPresenter
}

export interface IPresenter {
  state: any
}
