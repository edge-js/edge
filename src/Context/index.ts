/*
 * edge.js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import he from 'he'
import { Macroable } from 'macroable'
import { EdgeError } from 'edge-error'
import { ContextContract } from '../Contracts'

/**
 * An instance of this class passed to the escape
 * method ensures that underlying value is never
 * escaped.
 */
export class SafeValue {
	constructor(public value: any) {}
}

/**
 * The context passed to templates during Runtime. Context enables tags to
 * register custom methods which are available during runtime.
 *
 * For example: The `@each` tag defines `ctx.loop` method to loop over
 * Arrays and Objects.
 */
export class Context extends Macroable implements ContextContract {
	/**
	 * Required by Macroable
	 */
	protected static macros = {}
	protected static getters = {}

	constructor() {
		super()
	}

	/**
	 * Escapes the value to be HTML safe. Only strings are escaped
	 * and rest all values will be returned as it is.
	 */
	public escape<T>(input: T): T extends SafeValue ? T['value'] : T {
		return typeof input === 'string'
			? he.escape(input)
			: input instanceof SafeValue
			? input.value
			: input
	}

	/**
	 * Rethrows the runtime exception by re-constructing the error message
	 * to point back to the original filename
	 */
	public reThrow(error: any, filename: string, lineNumber: number): never {
		if (error instanceof EdgeError) {
			throw error
		}

		const message = error.message.replace(/state\./, '')
		throw new EdgeError(message, 'E_RUNTIME_EXCEPTION', {
			filename: filename,
			line: lineNumber,
			col: 0,
		})
	}
}

/**
 * Mark value as safe and not to be escaped
 */
export function safeValue(value: string) {
	return new SafeValue(value)
}
