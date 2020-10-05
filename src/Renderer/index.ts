/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import merge from 'lodash.merge'

import { Processor } from '../Processor'
import { Template } from '../Template'
import { EdgeRendererContract, CompilerContract } from '../Contracts'

/**
 * Renders a given template with it's shared state
 */
export class EdgeRenderer implements EdgeRendererContract {
	private locals: any = {}

	constructor(
		private compiler: CompilerContract,
		private globals: any,
		private processor: Processor
	) {}

	/**
	 * Share local variables with the template. They will overwrite the
	 * globals
	 */
	public share(data: any): this {
		merge(this.locals, data)
		return this
	}

	/**
	 * Render the template
	 */
	public render(templatePath: string, state: any = {}): string {
		const template = new Template(this.compiler, this.globals, this.locals, this.processor)
		return template.render(templatePath, state)
	}
}
