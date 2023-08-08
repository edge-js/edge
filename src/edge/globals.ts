/*
 * edge.js.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error untyped module
import stringify from 'js-stringify'
// @ts-expect-error untyped module
import inspect from '@poppinss/inspect'
import string from '@poppinss/utils/string'

import { htmlSafe, escape } from '../template.js'

/**
 * Inbuilt globals
 */
export const edgeGlobals = {
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
    return htmlSafe(inspect.string.html(value))
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
  htmlSafe: htmlSafe,

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
