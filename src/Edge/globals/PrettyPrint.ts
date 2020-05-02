/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * Pretty prints an Object with colors and formatting. Code is copied from
 * https://www.npmjs.com/package/pretty-print-json package and then tweaked
 * to fit our use cases.
 */

const inspectSymbol = Symbol.for('edge.inspect')

export class PrettyPrint {
  private styles = {
    string: 'color: rgb(173, 219, 103);',
    key: 'color: rgb(127, 219, 202);',
    boolean: 'color: rgb(247, 140, 108);',
    number: 'color: rgb(199, 146, 234);',
    null: 'color: rgb(255, 203, 139);',
    function: 'color: rgb(255, 203, 139);',
    pre: `
      padding: 30px 25px;
      background-color: rgb(6, 21, 38);
      color: rgb(214, 222, 235);
      border-radius: 6px;
      font-family: JetBrains Mono, Menlo, Monaco, monospace;
      font-size: 14px;
      overflow: auto;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      word-wrap: normal;
      tab-size: 4;
      line-height: 1.4;
      text-align: left;
    `,
  }

  /**
   * Return a boolean telling if the variable name is a
   * standard global
   */
  private isStandardGlobal (name) {
    return ['inspect', 'truncate', 'excerpt', 'safe'].includes(name)
  }

  /**
   * Encode html
   */
  private encodeHTML (value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/\\"/g, '&bsol;&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  /**
   * Build HTML value of the key
   */
  private buildValueHtml (value: string) {
    let type = 'number'

    if (value.startsWith('"[Function')) {
      type = 'function'
    } else if (/^"/.test(value)) {
      type = 'string'
    } else if (['true', 'false'].includes(value)) {
      type = 'boolean'
    } else if (value === 'null') {
      type = 'null'
    }
    return `<span style="${this.styles[type]}">${value}</span>`
  }

  /**
   * Build individual lines inside JSON
   */
  private replacer (_: string, p1: string, p2: string, p3: string, p4: string) {
    const part = { indent: p1, key: p2, value: p3, end: p4 }
    const findNameRegex = /(.*)(): /
    const indentHtml = part.indent || ''
    const keyName = part.key && part.key.replace(findNameRegex, '$1$2')
    const keyHtml = part.key ? `<span style="${this.styles.key}">${keyName}</span>: ` : ''
    const valueHtml = part.value ? this.buildValueHtml(part.value) : ''
    const endHtml = part.end || ''
    return indentHtml + keyHtml + valueHtml + endHtml
  }

  /**
   * JSON replacer that also handles circular references
   */
  private getJSONReplacer () {
    const seen = new WeakSet()

    return (key, value) => {
      if (this.isStandardGlobal(key)) {
        return undefined
      }

      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
      }

      if (typeof (value) === 'function') {
        return `[Function (${value.name || 'anonymous'})]`
      }

      return value
    }
  }

  /**
   * Pretty print by converting the value to JSON string first
   */
  public print (value: any) {
    const serialized = typeof (value[inspectSymbol]) === 'function'
      ? value[inspectSymbol]()
      : value

    const json = JSON.stringify(serialized, this.getJSONReplacer(), 2)

    const jsonLineRegex = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/mg
    return `<pre style="${this.styles.pre}"><code>${this.encodeHTML(json).replace(jsonLineRegex, this.replacer.bind(this))}</code></pre>`
  }
}
