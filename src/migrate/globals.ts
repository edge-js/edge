/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
// @ts-ignore untyped module
import stringify from 'js-stringify'
// @ts-ignore untyped module
import inspect from '@poppinss/inspect'
const { string: prettyPrintHtml } = inspect
import string from '@poppinss/utils/string'

import { htmlSafe, escape } from '../template.js'

export const GLOBALS = {
  /**
   * Converts new lines to break
   */
  nl2br: (value: string | null | undefined) => {
    if (!value) {
      return
    }

    return String(value).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>')
  },

  /**
   * Inspect state
   */
  inspect: (value: any) => {
    return htmlSafe(prettyPrintHtml.html(value))
  },

  /**
   * Truncate a sentence
   */
  truncate: (
    value: string,
    length: number = 20,
    options?: { completeWords?: boolean; strict?: boolean; suffix?: string }
  ) => {
    options = options || {}
    return string.truncate(value, length, {
      completeWords: options.completeWords !== undefined ? options.completeWords : !options.strict,
      suffix: options.suffix,
    })
  },

  /**
   * Raise an exception
   */
  raise: (message: string, options?: any) => {
    if (!options) {
      throw new Error(message)
    } else {
      throw new EdgeError(message, 'E_RUNTIME_EXCEPTION', options)
    }
  },

  /**
   * Generate an excerpt
   */
  excerpt: (
    value: string,
    length: number = 20,
    options?: { completeWords?: boolean; strict?: boolean; suffix?: string }
  ) => {
    options = options || {}
    return string.excerpt(value, length, {
      completeWords: options.completeWords !== undefined ? options.completeWords : !options.strict,
      suffix: options.suffix,
    })
  },
  /**
   * Using `"e"` because, `escape` is a global function in the
   * Node.js global namespace and edge parser gives priority
   * to it
   */
  e: escape,

  /**
   * Convert javascript data structures to a string. The method is a little
   * better over JSON.stringify in handling certain data structures. For
   * example: In JSON.stringify, the date is converted to an ISO string
   * whereas this method converts it to an actual instance of date
   */
  stringify: stringify,
  safe: htmlSafe,
  camelCase: string.camelCase,
  snakeCase: string.snakeCase,
  dashCase: string.dashCase,
  pascalCase: string.pascalCase,
  capitalCase: string.capitalCase,
  sentenceCase: string.sentenceCase,
  dotCase: string.dotCase,
  noCase: string.noCase,
  titleCase: string.titleCase,
  pluralize: string.pluralize,
  sentence: string.sentence,
  prettyMs: string.milliseconds.format,
  toMs: string.milliseconds.parse,
  prettyBytes: string.bytes.format,
  toBytes: string.bytes.parse,
  ordinal: string.ordinal,
} as Record<string, Function>
