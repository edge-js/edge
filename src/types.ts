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
import type { ParserTagDefinitionContract, ClaimTagFn } from 'edge-parser/types'

import { Template } from './template.js'

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
  mount(diskName: string, dirPath: string): void

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
}

/**
 * Shape of the props class passed to the components
 */
export interface PropsContract {
  /**
   * Find if a key exists inside the props
   */
  has(key: string): boolean

  /**
   * Return values for only the given keys
   */
  only(keys: string[]): { [key: string]: any }

  /**
   * Return values except the given keys
   */
  except(keys: string[]): { [key: string]: any }

  /**
   * Serialize all props to a string of HTML attributes
   */
  serialize(mergeProps?: any): { value: string }

  /**
   * Serialize only the given keys to a string of HTML attributes
   */
  serializeOnly(keys: string[], mergeProps?: any): { value: string }

  /**
   * Serialize except the given keys to a string of HTML attributes
   */
  serializeExcept(keys: string[], mergeProps?: any): { value: string }
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
 * Required for someone creating custom tags
 */
export type ParserContract = Parser
export type TagTokenContract = TagToken
export type EdgeBufferContract = EdgeBuffer
export type { ClaimTagFn }
