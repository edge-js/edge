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

import { Token } from 'edge-lexer'
import { MacroableConstructorContract } from 'macroable'
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
 * Shape of runtime context
 */
export interface ContextContract {
  presenter: { state: any },
  sharedState: any,
  safe <T extends any> (value: T): { value: T },
  newFrame (): void,
  setOnFrame (key: string, value: any): void,
  removeFrame (): void,
  escape <T> (input: T): T,
  resolve (key: string): any,
  set (key: string, value: any): void,
}

/**
 * Shape of context constructor
 */
export interface ContextConstructorContract extends MacroableConstructorContract<ContextContract> {
  new (presenter: any, sharedState: any): ContextContract,
}

/**
 * The final tag must have a tagName along with other properties
 * required by lexer and parser
 */
export interface TagContract extends ParseTagDefininationContract {
  tagName: string,
  run? (context: ContextConstructorContract): void,
}

/**
 * Shape of required tags
 */
export type TagsContract = {
  [tagName: string]: TagContract,
}

/**
 * Shape of the compiler
 */
export interface CompilerContract {
  compile (templatePath: string, inline: boolean): LoaderTemplate,
  generateLexerTokens (templatePath: string): Token[],
}

/**
 * Shape of the renderer that renders the edge templates
 */
export interface EdgeRendererContract {
  share (locals: any): this,
  render (templatePath: string, state?: any): string,
}

/**
 * Shape of options that can be passed to the
 * edge constructor
 */
export type EdgeOptions = {
  loader?: LoaderContract,
  cache?: boolean,
}

/**
 * Shape of the main module
 */
export interface EdgeContract {
  loader: LoaderContract,
  compiler: CompilerContract,

  registerTag (tag: TagContract): this,
  registerTemplate (templatePath: string, contents: LoaderTemplate): this,
  global (key: string, value: any): this,

  mount (diskName: string): this,
  mount (diskName: string, dirPath: string): this,
  unmount (diskName: string): this,

  getRenderer (): EdgeRendererContract,
  share (locals: any): EdgeRendererContract,
  render (templatePath: string, state?: any): string,
}
