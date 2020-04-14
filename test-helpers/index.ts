/*
* edge-parser
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { EOL } from 'os'

export function normalizeNewLines (value: string) {
  // eslint-disable-next-line @typescript-eslint/quotes
  return value.replace(/out\s\+=\s"\\n"/g, `out += ${EOL === '\n' ? `"\\n"` : `"\\r\\n"`}`)
}
