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
 * The inject tag is used within the components to share values with the
 * component caller.
 */
export const injectTag: TagContract = {
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
		isSubsetOf(parsed, [expressions.ObjectExpression, expressions.Identifier], () => {
			throw unallowedExpression(
				`"${token.properties.jsArg}" is not a valid key-value pair for the @share tag`,
				token.filename,
				parser.utils.getExpressionLoc(parsed)
			)
		})

		/**
		 * Ensure $slots are defined before merging shared state
		 */
		buffer.writeStatement(
			'if (!state.$slots || !state.$slots.$context) {',
			token.filename,
			token.loc.start.line
		)
		buffer.writeExpression(
			`throw new Error('Cannot use "@inject" outside of a component scope')`,
			token.filename,
			token.loc.start.line
		)
		buffer.writeStatement('}', token.filename, token.loc.start.line)

		buffer.writeExpression(
			`Object.assign(state.$slots.$context, ${parser.utils.stringify(parsed)})`,
			token.filename,
			token.loc.start.line
		)
	},
}
