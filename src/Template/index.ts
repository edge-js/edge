/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import merge from 'lodash.merge'

import { Context } from '../Context'
import { Processor } from '../Processor'
import { Props } from '../Component/Props'
import { Slots } from '../Component/Slots'
import { CompilerContract, TemplateContract } from '../Contracts'

/**
 * The template is used to compile and run templates. Also the instance
 * of template is passed during runtime to render `dynamic partials`
 * and `dynamic components`.
 */
export class Template implements TemplateContract {
	/**
	 * The shared state is used to hold the globals and locals,
	 * since it is shared with components too.
	 */
	private sharedState: any

	constructor(
		private compiler: CompilerContract,
		globals: any,
		locals: any,
		private processor: Processor,
		private options: { async: boolean }
	) {
		this.sharedState = merge({}, globals, locals)
	}

	/**
	 * Wraps template to a function
	 */
	private wrapToFunction(template: string, ...localVariables: string[]) {
		const args = ['template', 'state', 'ctx'].concat(localVariables)
		if (this.options.async) {
			return new Function(
				'',
				`return async function template (${args.join(',')}) { ${template} }`
			)()
		}
		return new Function('', `return function template (${args.join(',')}) { ${template} }`)()
	}

	/**
	 * Trims top and bottom new lines from the content
	 */
	public trimTopBottomNewLines(value: string) {
		return value.replace(/^\n|^\r\n/, '').replace(/\n$|\r\n$/, '')
	}

	/**
	 * Render the template inline by sharing the state of the current template.
	 *
	 * ```js
	 * const partialFn = template.renderInline('includes.user')
	 *
	 * // render and use output
	 * partialFn(template, state, ctx)
	 * ```
	 */
	public renderInline(templatePath: string, ...localVariables: string[]): Function {
		const { template: compiledTemplate } = this.compiler.compile(
			templatePath,
			this.options.async,
			localVariables
		)
		return this.wrapToFunction(compiledTemplate, ...localVariables)
	}

	/**
	 * Renders the template with custom state. The `sharedState` of the template is still
	 * passed to this template.
	 *
	 * Also a set of custom slots can be passed along. The slots uses the state of the parent
	 * template.
	 *
	 * ```js
	 * template.renderWithState('components.user', { username: 'virk' }, slotsIfAny)
	 * ```
	 */
	public renderWithState(template: string, state: any, slots: any, caller: any): string {
		const { template: compiledTemplate } = this.compiler.compile(template, this.options.async)

		const templateState = Object.assign({}, this.sharedState, state, {
			$slots: new Slots({ component: template, caller, slots }),
			$caller: caller,
			$props: new Props({ component: template, state }),
		})

		const context = new Context()
		return this.wrapToFunction(compiledTemplate)(this, templateState, context)
	}

	/**
	 * Render a template with it's state.
	 *
	 * ```js
	 * template.render('welcome', { key: 'value' })
	 * ```
	 */
	public render(template: string, state: any): Promise<string> | string {
		let { template: compiledTemplate } = this.compiler.compile(template, this.options.async)
		compiledTemplate = `let $context = undefined; ${compiledTemplate}`

		const templateState = Object.assign({}, this.sharedState, state)
		const context = new Context()

		/**
		 * Process template as a promise.
		 */
		if (this.options.async) {
			return this.wrapToFunction(compiledTemplate)(this, templateState, context).then(
				(output: string) => {
					output = this.trimTopBottomNewLines(output)
					return this.processor.executeOutput({ output, template: this })
				}
			)
		}

		const output = this.trimTopBottomNewLines(
			this.wrapToFunction(compiledTemplate)(this, templateState, context)
		)
		return this.processor.executeOutput({ output, template: this })
	}
}
