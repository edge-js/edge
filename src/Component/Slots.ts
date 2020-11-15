/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { safeValue } from '../Context'
import { lodash } from '@poppinss/utils'

/**
 * Class to ease interactions with component slots
 */
export class Slots {
	constructor(options: {
		component: string
		slots: { [name: string]: (...args: any[]) => string }
		caller: { filename: string; lineNumber: number }
	}) {
		this[Symbol.for('options')] = options
		Object.assign(this, options.slots)
	}

	/**
	 * Find if a key slot exists or not
	 */
	public has(key: string) {
		const value = lodash.get(this[Symbol.for('options')].slots, key)
		return value !== undefined && value !== null
	}

	/**
	 * Gives the return value of the slot by calling its function
	 */
	public render(name: string, ...args: any[]) {
		const slotFn = lodash.get(this[Symbol.for('options')].slots, name)

		if (typeof slotFn !== 'function') {
			throw new EdgeError(
				`"${name}" slot is required in order to render the "${
					this[Symbol.for('options')].component
				}" component`,
				'E_MISSING_SLOT',
				{
					filename: this[Symbol.for('options')].caller.filename,
					line: this[Symbol.for('options')].caller.lineNumber,
					col: 0,
				}
			)
		}

		return safeValue(slotFn(...args))
	}

	/**
	 * Render the slot if it exists
	 */
	public renderIfExists(name: string, ...args: any[]) {
		const slotFn = lodash.get(this[Symbol.for('options')].slots, name)
		if (typeof slotFn !== 'function') {
			return ''
		}
		return safeValue(slotFn(...args))
	}
}
