/**
 * edge
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { TagToken } from 'edge-lexer/types'
import type { Parser, EdgeBuffer } from 'edge-parser'
import type { ParserTagDefinitionContract } from 'edge-parser/types'

import type { Edge } from './edge/main.js'
import type { Template } from './template.js'

/**
 * The shape in which the loader must resolve the template
 */
export type LoaderTemplate = {
  template: string
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
   * List of pre-registered template
   */
  templates: { [templatePath: string]: LoaderTemplate }

  /**
   * Save disk name and dirPath to resolve views
   */
  mount(diskName: string, dirPath: string | URL): void

  /**
   * Remove disk from the previously saved paths
   */
  unmount(diskName: string): void

  /**
   * Resolve template contents
   */
  resolve(templatePath: string): LoaderTemplate

  /**
   * Make absolute path to a template
   */
  makePath(templatePath: string): string

  /**
   * Register in memory template and presenter
   */
  register(templatePath: string, contents: LoaderTemplate): void

  /**
   * Remove the pre-registered template
   */
  remove(templatePath: string): void
}

/**
 * The tag must have a tagName along with other properties
 * required by lexer and parser
 */
export interface TagContract extends ParserTagDefinitionContract {
  tagName: string
  boot?(template: typeof Template): void
}

/**
 * Shape of collection of tags
 */
export type TagsContract = {
  [tagName: string]: TagContract
}

/**
 * Shape of compiled template as a function
 */
export type CompiledTemplate = (
  template: Template,
  state: Record<string, any>,
  $context: Record<string, any> | undefined,
  ...localVariables: any[]
) => any

/**
 * Shape of the cache manager
 */
export interface CacheManagerContract {
  enabled: boolean
  get(templatePath: string): undefined | CompiledTemplate
  set(templatePath: string, compiledOutput: CompiledTemplate): void
  has(templatePath: string): boolean
  delete(templatePath: string): void
}

/**
 * Compiler constructor options
 */
export type CompilerOptions = {
  cache?: boolean
  async?: boolean
  compat?: boolean
}

/**
 * Shape of options that can be passed to the
 * edge constructor
 */
export type EdgeOptions = {
  loader?: LoaderContract
  cache?: boolean
}

/**
 * Shape of edge plugin
 */
export type PluginFn<T> = (edge: Edge, firstRun: boolean, options: T) => void

/**
 * Required when creating custom tags
 */
export type ParserContract = Parser
export type TagTokenContract = TagToken
export type EdgeBufferContract = EdgeBuffer

export * from 'edge-lexer/types'
export * from 'edge-parser/types'
