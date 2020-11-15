/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expressions } from 'edge-parser'

import { TagContract } from '../Contracts'
import { isSubsetOf, unallowedExpression, parseJsArg } from '../utils'

/**
 * The share tag is used within the components to share values with the
 * component caller.
 */
export const shareTag: TagContract = {
	block: false,
	seekable: true,
	tagName: 'share',
	noNewLine: true,

	compile(parser, buffer, token) {
		token.properties.jsArg = `(${token.properties.jsArg})`
		const parsed = parseJsArg(parser, token)

		/**
		 * The share tag only accepts an object expression.
		 */
		isSubsetOf(parsed, [expressions.ObjectExpression], () => {
			throw unallowedExpression(
				`"${token.properties.jsArg}" is not a valid key-value pair for the @share tag`,
				token.filename,
				parser.utils.getExpressionLoc(parsed)
			)
		})

		buffer.writeExpression(
			`state.$slots.share(${parser.utils.stringify(parsed)})`,
			token.filename,
			token.loc.start.line
		)
	},
}
