/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EdgeError } from 'edge-error'
import { lodash } from '@poppinss/utils'
import stringifyAttributes from 'stringify-attributes'
import { safeValue } from '../Context'

/**
 * Class to ease interactions with component props
 */
export class Props {
	constructor(options: {
		component: string
		state: any
		caller: { filename: string; lineNumber: number }
	}) {
		this[Symbol.for('options')] = options
		Object.assign(this, options.state)
	}

	/**
	 * Find if a key exists inside the props
	 */
	public has(key: string) {
		const value = lodash.get(this[Symbol.for('options')].state, key)
		return value !== undefined && value !== null
	}

	/**
	 * Returns the value of a key from the props. An exception is raised
	 * if value is undefined or null.
	 */
	public get(key: string, defaultValue?: any) {
		const value = lodash.get(this[Symbol.for('options')].state, key, defaultValue)
		if (value === undefined || value === null) {
			throw new EdgeError(
				`"${key}" prop is required in order to render the "${
					this[Symbol.for('options')].component
				}" component`,
				'E_MISSING_PROP',
				{
					filename: this[Symbol.for('options')].caller.filename,
					line: this[Symbol.for('options')].caller.lineNumber,
					col: 0,
				}
			)
		}

		return value
	}

	/**
	 * Return only given keys
	 */
	public only(keys: string[]) {
		return lodash.pick(this[Symbol.for('options')].state, keys)
	}

	/**
	 * Return except the mentioned keys
	 */
	public except(keys: string[]) {
		return lodash.omit(this[Symbol.for('options')].state, keys)
	}

	/**
	 * Serializes props to attributes
	 */
	public serialize(mergeProps?: any) {
		const props = this[Symbol.for('options')].state
		return safeValue(stringifyAttributes(lodash.merge({}, props, mergeProps)))
	}

	/**
	 * Serializes only the given props
	 */
	public serializeOnly(keys: string[], mergeProps?: any) {
		const props = this.only(keys)
		return safeValue(stringifyAttributes(lodash.merge({}, props, mergeProps)))
	}

	/**
	 * Serialize all props except the given keys
	 */
	public serializeExcept(keys: string[], mergeProps?: any) {
		const props = this.except(keys)
		return safeValue(stringifyAttributes(lodash.merge({}, props, mergeProps)))
	}
}
