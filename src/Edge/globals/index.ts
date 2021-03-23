/*
 * edge.js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { string } from '@poppinss/utils/build/helpers'
import { EdgeError } from 'edge-error'
import { safeValue } from '../../Template'

export const GLOBALS = {
  inspect: (value: any) => {
    return safeValue(require('@poppinss/inspect').string.html(value))
  },
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
  raise: (message: string, options?: any) => {
    if (!options) {
      throw new Error(message)
    } else {
      throw new EdgeError(message, 'E_RUNTIME_EXCEPTION', options)
    }
  },
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
  safe: safeValue,
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
  toSentence: string.toSentence,
  prettyBytes: string.prettyBytes,
  toBytes: string.toBytes,
  prettyMs: string.prettyMs,
  toMs: string.toMs,
  ordinalize: string.ordinalize,
}
