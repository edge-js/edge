'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const test = require('japa')
const dedent = require('dedent-js')
const Template = require('../../src/Template')
const Loader = require('../../src/Loader')

test.group('Template Compiler', (group) => {
  group.before(() => {
    require('../../test-helpers/transform-tags')(this, require('../../src/Tags'))
  })

  test('parse a simple template string without tags', (assert) => {
    const statement = `{{ username }}`
    const template = new Template({})
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple template string with tags', (assert) => {
    const statement = dedent`
    @if(username)
      {{ username }}
    @endif
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (this.context.resolve('username')) {
        out += \`  \${this.context.escape(this.context.resolve('username'))}\\n\`
      }
      return out
    }).bind(this)()
    `)
  })

  test('report error with correct lineno when string has error', (assert) => {
    const statement = dedent`
    @if(username, age)
      {{ username }}
    @endif
    `
    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <username, age> passed to (if) block')
  })

  test('parse a template by reading it via loader', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, loader)
    const output = template.compile('ifView')
    assert.equal(output, dedent`
    module.exports = function () {
      let out = new String()
      if (this.context.resolve('username')) {
        out += \`  \${this.context.escape(this.context.resolve('username'))}\\n\`
      }
      return out
    }
    `)
  })

  test('report error with correct lineno when file has error', (assert) => {
    assert.plan(2)
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, loader)
    template.sourceView('ifErrorView')
    const output = () => template.compile('ifErrorView')
    try {
      output()
    } catch (error) {
      assert.equal(error.message, 'E_INVALID_EXPRESSION: Invalid expression <username, age> passed to (if) block')
      assert.equal(error.stack.split('\n')[2], `at (${loader.getViewPath('ifErrorView')}:8:0)`)
    }
  })
})

test.group('Template Runner', () => {
  test('render a template by loading it from file', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, loader)
    template.sourceView('welcome')
    const output = template.render('welcome', { username: 'virk' })
    assert.equal(output.trim(), 'virk')
  })

  test('render a template from string', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, loader)
    const output = template.renderString('{{ username }}', { username: 'virk' })
    assert.equal(output.trim(), 'virk')
  })

  test('make use of presenter when rendering the view', (assert) => {
    const loader = new Loader(
      path.join(__dirname, '../../test-helpers/views'),
      path.join(__dirname, '../../test-helpers/presenters')
    )
    const template = new Template(this.tags, {}, loader)
    const output = template.presenter('User').renderString('{{ username }}', { username: 'virk' })
    assert.equal(output.trim(), 'VIRK')
  })

  test('pass locals when rendering the view', (assert) => {
    const loader = new Loader(
      path.join(__dirname, '../../test-helpers/views'),
      path.join(__dirname, '../../test-helpers/presenters')
    )
    const template = new Template(this.tags, {}, loader)
    const output = template.share({username: 'virk'}).renderString('{{ username }}')
    assert.equal(output.trim(), 'virk')
  })
})
