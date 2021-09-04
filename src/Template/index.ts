/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Macroable } from 'macroable'
import { EdgeError } from 'edge-error'
import { lodash } from '@poppinss/utils'
import { string } from '@poppinss/utils/build/helpers'

import { Processor } from '../Processor'
import { Props } from '../Component/Props'
import { CompilerContract, TemplateContract } from '../Contracts'

/**
 * An instance of this class passed to the escape
 * method ensures that underlying value is never
 * escaped.
 */
export class SafeValue {
  constructor(public value: any) {}
}

/**
 * Escapes a given string
 */
export function escape(input: any): string {
  return input instanceof SafeValue ? input.value : string.escapeHTML(String(input))
}

/**
 * Mark value as safe and not to be escaped
 */
export function safeValue(value: string) {
  return new SafeValue(value)
}

/**
 * The template is used to compile and run templates. Also the instance
 * of template is passed during runtime to render `dynamic partials`
 * and `dynamic components`.
 */
export class Template extends Macroable implements TemplateContract {
  /**
   * Required by Macroable
   */
  protected static macros = {}
  protected static getters = {}

  /**
   * The shared state is used to hold the globals and locals,
   * since it is shared with components too.
   */
  private sharedState: any

  constructor(
    private compiler: CompilerContract,
    globals: any,
    locals: any,
    private processor: Processor
  ) {
    super()
    this.sharedState = lodash.merge({}, globals, locals)
  }

  /**
   * Wraps template to a function
   */
  private wrapToFunction(template: string, ...localVariables: string[]) {
    const args = ['template', 'state', '$context'].concat(localVariables)

    if (this.compiler.async) {
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
  private trimTopBottomNewLines(value: string) {
    return value.replace(/^\n|^\r\n/, '').replace(/\n$|\r\n$/, '')
  }

  /**
   * Render a compiled template with state
   */
  private renderCompiled(compiledTemplate: string, state: any) {
    const templateState = Object.assign({}, this.sharedState, state)
    const $context = {}

    /**
     * Process template as a promise.
     */
    if (this.compiler.async) {
      return this.wrapToFunction(compiledTemplate)(this, templateState, $context).then(
        (output: string) => {
          output = this.trimTopBottomNewLines(output)
          return this.processor.executeOutput({ output, template: this })
        }
      )
    }

    const output = this.trimTopBottomNewLines(
      this.wrapToFunction(compiledTemplate)(this, templateState, $context)
    )

    return this.processor.executeOutput({ output, template: this })
  }

  /**
   * Render a partial
   *
   * ```js
   * const partialFn = template.compilePartial('includes/user')
   *
   * // render and use output
   * partialFn(template, state, ctx)
   * ```
   */
  public compilePartial(templatePath: string, ...localVariables: string[]): Function {
    const { template: compiledTemplate } = this.compiler.compile(templatePath, localVariables)
    return this.wrapToFunction(compiledTemplate, ...localVariables)
  }

  /**
   * Render a component
   *
   * ```js
   * const componentFn = template.compileComponent('components/button')
   *
   * // render and use output
   * componentFn(template, template.getComponentState(props, slots, caller), ctx)
   * ```
   */
  public compileComponent(templatePath: string, ...localVariables: string[]): string {
    const { template: compiledTemplate } = this.compiler.compile(templatePath, localVariables)
    return this.wrapToFunction(compiledTemplate, ...localVariables)
  }

  /**
   * Returns the isolated state for a given component
   */
  public getComponentState(
    props: { [key: string]: any },
    slots: { [key: string]: any },
    caller: { filename: string; line: number; col: number }
  ) {
    return Object.assign({}, this.sharedState, props, {
      $slots: slots,
      $caller: caller,
      $props: new Props(props),
    })
  }

  /**
   * Render a template with it's state.
   *
   * ```js
   * template.render('welcome', { key: 'value' })
   * ```
   */
  public render<T extends Promise<string> | string>(template: string, state: any): T {
    let { template: compiledTemplate } = this.compiler.compile(template)
    return this.renderCompiled(compiledTemplate, state)
  }

  /**
   * Render template from a raw string
   *
   * ```js
   * template.renderRaw('Hello {{ username }}', { username: 'virk' })
   * ```
   */
  public renderRaw<T extends Promise<string> | string>(
    contents: string,
    state: any,
    templatePath?: string
  ): T {
    let { template: compiledTemplate } = this.compiler.compileRaw(contents, templatePath)
    return this.renderCompiled(compiledTemplate, state)
  }

  /**
   * Escapes the value to be HTML safe. Only strings are escaped
   * and rest all values will be returned as it is.
   */
  public escape(input: any): string {
    return escape(input)
  }

  /**
   * Raise an error
   */
  public newError(errorMessage: string, filename: string, lineNumber: number, column: number) {
    throw new EdgeError(errorMessage, 'E_RUNTIME_EXCEPTION', {
      filename: filename,
      line: lineNumber,
      col: column,
    })
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
