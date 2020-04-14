/*
 * edge.js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import truncatise from 'truncatise'
import { PrettyPrint } from './PrettyPrint'
import { safeValue } from '../../Context'

export const GLOBALS = {
  inspect: (value) => {
    return safeValue(new PrettyPrint().print(value))
  },
  truncate: (value: string, length: number = 20, options?: { strict: boolean, suffix: string }) => {
    return truncatise(value, {
      Strict: !!options?.strict,
      StripHTML: false,
      TruncateLength: length,
      TruncateBy: 'characters',
      Suffix: options?.suffix,
    })
  },
  excerpt: (value: string, length: number = 20, options?: { strict: boolean, suffix: string }) => {
    return truncatise(value, {
      Strict: !!options?.strict,
      StripHTML: true,
      TruncateLength: length,
      TruncateBy: 'characters',
      Suffix: options?.suffix,
    })
  },
  safe: safeValue,
}
