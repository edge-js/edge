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
const Ast = require('../../src/Ast')

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

    const ast = new Ast(tags, statement).parse()
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

    const ast = new Ast(tags, statement).parse()
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

    const ast = () => new Ast(tags, statement).parse()
    assert.throw(ast, `E_UNCLOSED_TAG: Unclosed (each) tag found as <@each('user in users')> statement. Make sure to close it as (endeach)`)
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

    const ast = new Ast(tags, statement).parse()
    assert.equal(ast[0].tag, 'if')
    assert.lengthOf(ast[0].childs, 3)
    assert.equal(ast[0].childs[1].body.trim(), '@else')
  })

  test('add deep nested tags as childs', (assert) => {
    const statement = `
    @component('components.alert', { username })
      @slot('header')
        <h2> This is the header </h2>
      @endslot
      This is the body
    @endcomponent
    `
    const tags = {
      component: {
        name: 'component',
        isBlock: true,
        compile () {}
      },
      slot: {
        name: 'slot',
        isBlock: true,
        compile () {}
      }
    }

    const ast = new Ast(tags, statement).parse()
    assert.equal(ast[0].tag, 'component')
    assert.equal(ast[0].childs[0].tag, 'slot')
    assert.lengthOf(ast[0].childs[0].childs, 1)
    assert.equal(ast[0].childs[0].childs[0].body.trim(), '<h2> This is the header </h2>')
  })
})
