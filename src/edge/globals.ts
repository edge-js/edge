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
import classNames from 'classnames'
// @ts-expect-error untyped module
import inspect from '@poppinss/inspect'
import string from '@poppinss/utils/string'

import { htmlSafe, escape } from '../template.js'
import { stringifyAttributes } from '../utils.js'

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
   * Helpers related to HTML
   */
  html: {
    escape: escape,
    safe: htmlSafe,
    classNames: classNames,
    attrs: (values: Record<string, any>) => {
      return htmlSafe(stringifyAttributes(values))
    },
  },

  /**
   * Helpers related to JavaScript
   */
  js: {
    stringify: stringify,
  },
}
