/*
 * edge.js
 *
 * (c) EdgeJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import he from 'he'
import { EdgeError } from 'edge-error'
import lodash from '@poppinss/utils/lodash'
import Macroable from '@poppinss/macroable'

import { Compiler } from './compiler.js'
import { Processor } from './processor.js'
import { Props } from './migrate/props.js'
import { stringifyAttributes } from './utils.js'
import type { CompiledTemplate } from './types.js'
import { ComponentProps } from './component/props.js'

/**
 * An instance of this class passed to the escape
 * method ensures that underlying value is never
 * escaped.
 */
class SafeValue {
  constructor(public value: any) {}
}

/**
 * Escapes a given string
 */
export function escape(input: any): string {
  return input instanceof SafeValue ? input.value : he.escape(String(input))
}

/**
 * Mark value as safe and not to be escaped
 */
export function htmlSafe(value: string) {
  return new SafeValue(value)
}

/**
 * The template is used to compile and run templates. Also the instance
 * of template is passed during runtime to render `dynamic partials`
 * and `dynamic components`.
 */
export class Template extends Macroable {
  #compiler: Compiler
  #processor: Processor

  /**
   * The shared state is used to hold the globals and locals,
   * since it is shared with components too.
   */
  #sharedState: Record<string, any>

  constructor(compiler: Compiler, globals: any, locals: any, processor: Processor) {
    super()
    this.#compiler = compiler
    this.#processor = processor
    this.#sharedState = lodash.merge({}, globals, locals)
  }

  /**
   * Trims top and bottom new lines from the content
   */
  #trimTopBottomNewLines(value: string) {
    return value.replace(/^\n|^\r\n/, '').replace(/\n$|\r\n$/, '')
  }

  /**
   * Render a compiled template with state
   */
  #renderCompiled(compiledTemplate: CompiledTemplate, state: any) {
    const templateState = Object.assign({}, this.#sharedState, state)
    const $context = {}

    /**
     * Process template as a promise.
     */
    if (this.#compiler.async) {
      return compiledTemplate(this, templateState, $context).then((output: string) => {
        output = this.#trimTopBottomNewLines(output)
        return this.#processor.executeOutput({ output, template: this, state: templateState })
      })
    }

    const output = this.#trimTopBottomNewLines(compiledTemplate(this, templateState, $context))
    return this.#processor.executeOutput({ output, template: this, state: templateState })
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
  compilePartial(templatePath: string, ...localVariables: string[]): CompiledTemplate {
    return this.#compiler.compile(templatePath, localVariables)
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
  compileComponent(templatePath: string): CompiledTemplate {
    return this.#compiler.compile(templatePath)
  }

  /**
   * Returns the isolated state for a given component
   */
  getComponentState(
    props: { [key: string]: any },
    slots: { [key: string]: any },
    caller: { filename: string; line: number; col: number }
  ) {
    return Object.assign({}, this.#sharedState, props, {
      $slots: slots,
      $caller: caller,
      $props: this.#compiler.compat ? new Props(props) : new ComponentProps(props),
    })
  }

  /**
   * Render a template with it's state.
   *
   * ```js
   * template.render('welcome', { key: 'value' })
   * ```
   */
  render<T extends Promise<string> | string>(template: string, state: any): T {
    let compiledTemplate = this.#compiler.compile(template)
    return this.#renderCompiled(compiledTemplate, state)
  }

  /**
   * Render template from a raw string
   *
   * ```js
   * template.renderRaw('Hello {{ username }}', { username: 'virk' })
   * ```
   */
  renderRaw<T extends Promise<string> | string>(
    contents: string,
    state: any,
    templatePath?: string
  ): T {
    let compiledTemplate = this.#compiler.compileRaw(contents, templatePath)
    return this.#renderCompiled(compiledTemplate, state)
  }

  /**
   * Escapes the value to be HTML safe. Only strings are escaped
   * and rest all values will be returned as it is.
   */
  escape(input: any): string {
    return escape(input)
  }

  /**
   * Converts an object to HTML attributes
   */
  toAttributes(attributes: Record<string, any>) {
    return stringifyAttributes(attributes)
  }

  /**
   * Raise an error
   */
  newError(errorMessage: string, filename: string, lineNumber: number, column: number) {
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
  reThrow(error: any, filename: string, lineNumber: number): never {
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
