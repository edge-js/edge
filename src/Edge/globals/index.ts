/*
 * edge.js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

import { PrettyPrint } from './PrettyPrint'
import { safeValue } from '../../Context'

export const GLOBALS = {
  inspect: (value) => {
    return safeValue(new PrettyPrint().print(value))
  },
  safe: safeValue,
}
