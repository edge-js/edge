'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const dedent = require('dedent-js')
const Template = require('../src/Template/compiler')
const ifTag = require('../src/Tags').ifTag

test.group('Template Compiler', (group) => {
  test('parse a simple inline tag', (assert) => {
    const statement = `
    @include('users.profile')
    `
    const tags = {
      include: {
        name: 'include',
        isBlock: false,
        fn: function () {}
      }
    }

    const template = new Template(tags, statement)
    const ast = template.toAst()
    assert.equal(ast[0].tag, 'include')
    assert.deepEqual(ast[0].childs, [])
    assert.equal(ast[0].args, `'users.profile'`)
  })

  test('parse a block tag', (assert) => {
    const statement = `
    @each('user in users')
    @endeach
    `

    const tags = {
      each: {
        name: 'each',
        isBlock: true,
        fn: function () {}
      }
    }

    const template = new Template(tags, statement)
    const ast = template.toAst()
    assert.equal(ast[0].tag, 'each')
    assert.deepEqual(ast[0].childs, [])
    assert.equal(ast[0].args, `'user in users'`)
  })

  test('throw exception when unclosed block tags found', (assert) => {
    const statement = `
    @each('user in users')
    `
    const tags = {
      each: {
        name: 'each',
        isBlock: true,
        fn: function () {}
      }
    }

    const template = new Template(tags, statement)
    const ast = () => template.toAst()
    assert.throw(ast, `InvalidTemplateException: E_UNCLOSED_TAG: lineno:1 Unclosed (each) tag found as <@each('user in users')> statement. Make sure to close it as (endeach)`)
  })

  test('add nested tags as childs', (assert) => {
    const statement = `
    @if(user.name)
    <p> Hello {{ user.name }} </p>
    @else
    <p> Hello stranger </p>
    @endif
    `
    const tags = {
      if: {
        name: 'if',
        isBlock: true,
        compile () {}
      }
    }

    const template = new Template(tags, statement)
    const ast = template.toAst()
    assert.equal(ast[0].tag, 'if')
    assert.lengthOf(ast[0].childs, 3)
    assert.equal(ast[0].childs[1].body.trim(), '@else')
  })

  test('call tags functions', (assert) => {
    const statement = `@include('users.profile')`
    let includeTagCalled = false

    const tags = {
      include: {
        name: 'include',
        isBlock: false,
        compile () {
          includeTagCalled = true
        }
      }
    }

    const template = new Template(tags, statement)
    template.compile()
    assert.equal(includeTagCalled, true)
  })

  test('replace tags defination with their output', (assert) => {
    const statement = `
    @if(users.length)
    <p> Hello {{ users.join(', ') }}
    @endif
    `

    const tags = {
      if: {
        name: 'if',
        isBlock: true,
        compile (parser, lexer, buffer) {
          return buffer.writeLine('compiled')
        }
      }
    }

    const template = new Template(tags, statement)
    const compiledTemplate = template.compile()
    assert.deepEqual(compiledTemplate, dedent`
      module.exports = function () {
        let out = new String()
        compiled
        return out
      }`)
  })

  test('throw exception when invalid expression passed inside {{ }}', (assert) => {
    const statement = `Users trying to jump hard {{ a of b }}`

    const tags = {
      if: {
        name: 'if',
        isBlock: true,
        compile (parser, lexer, buffer) {
          return buffer.writeLine('compiled')
        }
      }
    }

    const template = new Template(tags, statement)
    const compiledTemplate = () => template.compile()
    assert.throw(compiledTemplate, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 char:29 Invalid expression <a of b>')
  })

  test('throw exception when invalid expression inside an if block', (assert) => {
    const statement = `
    @if(a, b)
    @endif
    `

    const tags = {
      if: {
        name: 'if',
        isBlock: true,
        compile: ifTag.compile.bind(ifTag)
      }
    }

    const template = new Template(tags, statement)
    const compiledTemplate = () => template.compile()
    assert.throw(compiledTemplate, 'InvalidExpressionException: E_INVALID_EXPRESSION: lineno:1 Invalid expression <a, b> passed to (if) block.')
  })

  test('parse everything inside {{ }}', (assert) => {
    const statement = `{{ 2 + 2 }}`

    const template = new Template({}, statement)
    const compiledTemplate = template.compile()
    assert.equal(compiledTemplate, dedent `
    module.exports = function () {
      let out = new String()
      out += \`\${this.escape(2 + 2)}\\n\`
      return out
    }`)
  })

  test('keep expression starting with @ untouch', (assert) => {
    const statement = `@{{ 2 + 2 }}`

    const template = new Template({}, statement)
    const compiledTemplate = template.compile()
    assert.equal(compiledTemplate, dedent`
    module.exports = function () {
      let out = new String()
      out += \`{{2 + 2}}\\n\`
      return out
    }`)
  })

  test('do not escape expressions wrapped under {{{ }}}', (assert) => {
    const statement = `{{{ 2 + 2 }}}`

    const template = new Template({}, statement)
    const compiledTemplate = template.compile()
    assert.equal(compiledTemplate, dedent`
    module.exports = function () {
      let out = new String()
      out += \`\${2 + 2}\\n\`
      return out
    }`)
  })

  test('track errors with right line and char numbers', (assert) => {
    const statement = `
    @if(username)
      {{ var a = b }}
    @endif
    `

    const tags = {
      if: {
        name: ifTag.tagName,
        isBlock: ifTag.isBlock,
        compile: ifTag.compile.bind(ifTag)
      }
    }
    const template = new Template(tags, statement)
    const compiledTemplate = () => template.compile()
    assert.throw(compiledTemplate, 'E_INVALID_EXPRESSION: lineno:2 char:9 Invalid expression <var a = b>')
  })
})
