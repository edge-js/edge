/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Edge } from './src/edge/main.js'

export { EdgeError } from 'edge-error'
export { Template } from './src/template.js'
export { edgeGlobals } from './src/edge/globals.js'
export { Edge }

const edge = Edge.create()
export default edge
