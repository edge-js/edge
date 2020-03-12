/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import { inspect as utilInspect } from 'util'
import {
  size,
  last,
  first,
  range,
  groupBy,
  truncate,
} from 'lodash'

import { safeValue, withCtx } from '../../Context'
import { EdgeContract, ContextContract } from '../../Contracts'

/**
 * Inspect value.
 */
function inspect (
  ctx: ContextContract,
  valueToInspect: any,
  depth: number = 1,
) {
  const inspectedString = `<pre>${utilInspect(valueToInspect, {
    showHidden: true,
    compact: false,
    depth: depth,
  })}</pre>`

  const filename = `<span style="color: #999; position: absolute; right: 20px; top: 10px;">
    ${ctx.resolve('$filename')}
  </span>`

  return safeValue(
    `<div class="__inspect_output" style="background: #000; color: #fff; padding: 20px; position: relative;">${inspectedString}${filename}</div>`,
  )
}

/**
 * Compacting the inspect output of self
 */
inspect[Symbol.for('nodejs.util.inspect.custom')] = function customInspect () {
  return '[inspect]'
}

/**
 * A list of default globals
 */
export default function globals (edge: EdgeContract) {
  edge.global('inspect', withCtx(inspect))
  edge.global('range', (start: number, end?: number, step?: number) => range(start, end, step))
  edge.global('first', first)
  edge.global('last', last)
  edge.global('groupBy', groupBy)
  edge.global('size', size)
  edge.global('truncate', truncate)
  edge.global('toAnchor', (url: string, title: string = url) => {
    return safeValue(`<a href="${url}"> ${title} </a>`)
  })
  edge.global('style', (url: string, title: string = url) => {
    return safeValue(`<a href="${url}"> ${title} </a>`)
  })
}
