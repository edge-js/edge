/*
 * edge-js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ProcessorContract, TemplateContract } from '../Contracts'

/**
 * Exposes the API to register a set of handlers to process the
 * templates output at different stages
 */
export class Processor implements ProcessorContract {
	private handlers: Map<string, Set<(...args: any[]) => any>> = new Map()

	/**
	 * Execute raw handlers
	 */
	public executeRaw(data: { raw: string; path: string }): string {
		const handlers = this.handlers.get('raw')
		if (!handlers) {
			return data.raw
		}

		handlers.forEach((handler) => {
			const output = handler(data)
			if (output !== undefined) {
				data.raw = output
			}
		})

		return data.raw
	}

	/**
	 * Execute compiled handlers
	 */
	public executeCompiled(data: { compiled: string; path: string }): string {
		const handlers = this.handlers.get('compiled')
		if (!handlers) {
			return data.compiled
		}

		handlers.forEach((handler) => {
			const output = handler(data)
			if (output !== undefined) {
				data.compiled = output
			}
		})

		return data.compiled
	}

	/**
	 * Execute output handlers
	 */
	public executeOutput(data: { output: string; template: TemplateContract }): string {
		const handlers = this.handlers.get('output')
		if (!handlers) {
			return data.output
		}

		handlers.forEach((handler) => {
			const output = handler(data)
			if (output !== undefined) {
				data.output = output
			}
		})

		return data.output
	}

	/**
	 * Define a processor function
	 */
	public process(
		event: 'raw',
		handler: (data: { raw: string; path: string }) => string | void
	): this
	public process(
		event: 'compiled',
		handler: (data: { compiled: string; path: string }) => string | void
	): this
	public process(
		event: 'output',
		handler: (data: { output: string; template: TemplateContract }) => string | void
	): this
	public process(event: string, handler: (...args: any[]) => any): this {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, new Set())
		}

		this.handlers.get(event)!.add(handler)
		return this
	}
}
