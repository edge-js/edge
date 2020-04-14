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
export class PrettyPrint {
  private styles = {
    string: 'color: #6caedd;',
    key: 'color: #ec5f67;',
    boolean: 'color: #99c794;',
    number: 'color: #99c794;',
    null: 'color: dimgray;',
    pre: `
      padding: 10px 30px;
      background-color: #24282A;
      color: #d4d4d4;
      font-family: Menlo, Monaco, "Courier New", monospace;
      font-size: 14px;
      text-align: left;
    `,
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
    const strType = /^"/.test(value) && 'string'
    const boolType = ['true', 'false'].includes(value) && 'boolean'
    const nullType = value === 'null' && 'null'
    const type = boolType || nullType || strType || 'number'
    return `<span style="${this.styles[type]}"> ${value} </span>`
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
   * Pretty print by converting the value to JSON string first
   */
  public print (value: any) {
    const json = JSON.stringify(value, null, 2)
    const jsonLineRegex = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/mg
    return `<pre style="${this.styles.pre}">
      <code>${this.encodeHTML(json).replace(jsonLineRegex, this.replacer.bind(this))}</code>
    </pre>`
  }
}
