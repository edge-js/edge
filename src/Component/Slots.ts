/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { safeValue } from '../Context'

/**
 * Class to ease interactions with component slots
 */
export class Slots {
	constructor(options: {
		component: string
		slots: { [name: string]: (...args: any[]) => string }
		caller: { filename: string; lineNumber: number; raise: (message: string) => never }
	}) {
		this[Symbol.for('options')] = options
		Object.assign(this, options.slots)
	}

	/**
	 * Share object with the slots object. This will allow slot functions
	 * to access these values as `this.component`
	 */
	public share(values: any) {
		const slots = this[Symbol.for('options')].slots
		slots.component = slots.component || {}
		Object.assign(slots.component, values)
	}

	/**
	 * Find if a slot exists
	 */
	public has(name: string) {
		return !!this[Symbol.for('options')].slots[name]
	}

	/**
	 * Render slot. Raises exception when the slot is missing
	 */
	public render(name: string, ...args: any[]) {
		if (!this.has(name)) {
			this[Symbol.for('options')].caller.raise(
				`"${name}" slot is required in order to render the "${
					this[Symbol.for('options')].component
				}" component`
			)
		}

		return safeValue(this[Symbol.for('options')].slots[name](...args))
	}

	/**
	 * Render slot only if it exists
	 */
	public renderIfExists(name: string, ...args: any[]) {
		if (!this.has(name)) {
			return ''
		}
		return safeValue(this[Symbol.for('options')].slots[name](...args))
	}
}
