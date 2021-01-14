/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { expressions, Parser } from 'edge-parser'

import { TagContract } from '../Contracts'
import { unallowedExpression, isSubsetOf, parseJsArg } from '../utils'

/**
 * List of expressions allowed for the include tag
 */
export const ALLOWED_EXPRESSION = [
	expressions.Identifier,
	expressions.Literal,
	expressions.LogicalExpression,
	expressions.MemberExpression,
	expressions.ConditionalExpression,
	expressions.CallExpression,
	expressions.TemplateLiteral,
]

/**
 * Returns the expression for rendering the partial
 */
export function getRenderExpression(parser: Parser, parsedExpression: any) {
	/**
	 * We need to pass the local variables to the partial render function
	 */
	const localVariables = parser.stack.list()

	/**
	 * Arguments for the `renderInline` method
	 */
	const renderArgs = localVariables.length
		? [
				parser.utils.stringify(parsedExpression),
				localVariables.map((localVar) => `"${localVar}"`).join(','),
		  ]
		: [parser.utils.stringify(parsedExpression)]

	/**
	 * Arguments for invoking the output function of `renderInline`
	 */
	const callFnArgs = localVariables.length
		? ['template', 'state', '$context', localVariables.map((localVar) => localVar).join(',')]
		: ['template', 'state', '$context']

	return `template.compilePartial(${renderArgs.join(',')})(${callFnArgs.join(',')})`
}

/**
 * Include tag is used to include partials in the same scope of the parent
 * template.
 *
 * ```edge
 * @include('partials.header')
 * ```
 */
export const includeTag: TagContract = {
	block: false,
	seekable: true,
	tagName: 'include',

	/**
	 * Compiles else block node to Javascript else statement
	 */
	compile(parser, buffer, token) {
		const awaitKeyword = parser.asyncMode ? 'await ' : ''
		const parsed = parseJsArg(parser, token)

		/**
		 * Only mentioned expressions are allowed inside `@include` tag
		 */
		isSubsetOf(parsed, ALLOWED_EXPRESSION, () => {
			unallowedExpression(
				`"${token.properties.jsArg}" is not a valid argument type for the @include tag`,
				token.filename,
				parser.utils.getExpressionLoc(parsed)
			)
		})

		buffer.outputExpression(
			`${awaitKeyword}${getRenderExpression(parser, parsed)}`,
			token.filename,
			token.loc.start.line,
			false
		)
	},
}
