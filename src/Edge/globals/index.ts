/**
 * @module edge
 */

/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { inspect as utilInspect } from 'util'
import { EdgeContract, ContextContract } from '../../Contracts'

/**
 * Inspect value.
 */
function inspect (ctx: ContextContract, valueToInspect: any, depth: number = 1) {
  return ctx.safe(`<pre style="background: #000; color: #fff; padding: 20px;">${utilInspect(valueToInspect, {
    showHidden: true,
    compact: false,
    depth: depth,
  })}</pre>`)
}

export default function globals (edge: EdgeContract) {
  edge.global('inspect', inspect)
}
