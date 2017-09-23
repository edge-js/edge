'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
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

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.equal(ast[0].tag, 'include')
    assert.deepEqual(ast[0].childs, [])
    assert.equal(ast[0].args, `'users.profile'`)
    assert.equal(ast[0].lineno, 1)
    assert.equal(ast[0].body, `@include('users.profile')`)
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

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.equal(ast[0].tag, 'each')
    assert.deepEqual(ast[0].childs, [])
    assert.equal(ast[0].args, `'user in users'`)
    assert.equal(ast[0].body, `@each('user in users')`)
    assert.equal(ast[0].lineno, 1)
    assert.equal(ast[0].end.body, '@endeach')
    assert.equal(ast[0].end.lineno, 2)
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

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = () => new Ast(tags, regExp).parse(statement)
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

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.equal(ast[0].tag, 'if')
    assert.lengthOf(ast[0].childs, 3)
    assert.equal(ast[0].childs[1].body.trim(), '@else')
    assert.equal(ast[0].end.lineno, 5)
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

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.equal(ast[0].tag, 'component')
    assert.equal(ast[0].childs[0].tag, 'slot')
    assert.lengthOf(ast[0].childs[0].childs, 1)
    assert.equal(ast[0].childs[0].childs[0].body.trim(), '<h2> This is the header </h2>')
    assert.equal(ast[0].end.lineno, 6)
  })

  test('add comments to the lineComments key of the line', (assert) => {
    const statement = `
    {{-- hello dude --}}
    <h2> Hello world </h2>
    `
    const ast = new Ast({}).parse(statement)
    assert.lengthOf(ast, 1)
    assert.deepEqual(ast[0].body.trim(), '<h2> Hello world </h2>')
  })

  test('parse inline comments next to the some content', (assert) => {
    const statement = `
    <h2> Hello world </h2>{{-- end h2 --}}
    `
    const ast = new Ast({}).parse(statement)
    assert.equal(ast[0].body, '<h2> Hello world </h2>')
  })

  test('parse multiple comments on a single line', (assert) => {
    const statement = `
    <h2> Hello {{-- the world will be capitalized --}}world </h2>{{-- end h2 --}}
    `
    const ast = new Ast({}).parse(statement)
    assert.equal(ast[0].body, '<h2> Hello world </h2>')
  })

  test('parse multi line comments', (assert) => {
    const statement = `
    {{--
    Here is a simple
    multi-line comment
    --}}
    `
    const ast = new Ast({}).parse(statement)
    assert.lengthOf(ast, 0)
  })

  test('ignore tags inside comments', (assert) => {
    const statement = `
    {{--
    @each(user in users)
    @endeach
    --}}
    `

    const tags = {
      each: {
        name: 'each',
        isBlock: true,
        compile () {}
      }
    }

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.lengthOf(ast, 0)
  })

  test('look for closing comments only when inside comments', (assert) => {
    const statement = `
    @each(user in users)
      --}}
    @endeach
    `

    const tags = {
      each: {
        name: 'each',
        isBlock: true,
        compile () {}
      }
    }

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.lengthOf(ast, 1)
    assert.equal(ast[0].tag, 'each')
    assert.equal(ast[0].childs[0].body.trim(), '--}}')
  })

  test('parse a complex template', (assert) => {
    const statement = `
    {{-- Check if users exists --}}
    @if(users.length)
      {{--
      Loop over list of all the users
      --}}
      <div class="user">
        @each(user in users)
          {{ user.username }}
        @endeach
      </div>{{-- end user --}}
    @endif
    `

    const tags = {
      each: {
        name: 'each',
        isBlock: true,
        compile () {}
      },
      if: {
        name: 'if',
        isBlock: true,
        compile () {}
      }
    }

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.lengthOf(ast, 1)
    assert.equal(ast[0].lineno, 2)
    assert.equal(ast[0].end.lineno, 11)
    assert.lengthOf(ast[0].childs, 3)
    assert.equal(ast[0].childs[0].body.trim(), '<div class="user">')
    assert.equal(ast[0].childs[1].tag, 'each')
    assert.lengthOf(ast[0].childs[1].childs, 1)
    assert.equal(ast[0].childs[2].body.trim(), '</div>')
  })

  test('should be able to define self closing block tags', (assert) => {
    const statement = `
    @!yield('foo')
    `
    const tags = {
      yield: {
        name: 'yield',
        isBlock: true,
        fn: function () {}
      }
    }

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)
    assert.equal(ast[0].tag, 'yield')
    assert.deepEqual(ast[0].childs, [])
    assert.equal(ast[0].args, `'foo'`)
    assert.equal(ast[0].lineno, 1)
    assert.equal(ast[0].selfClosing, true)
    assert.equal(ast[0].body, `@!yield('foo')`)
  })

  test('jump line numbers when multi-line tags are detected', (assert) => {
    const statement = `
    @component(
      'user',
      { username: 'virk' }
    )
      {{ user.username }}
    @endcomponent
    `

    const tags = {
      component: {
        name: 'component',
        isBlock: true,
        compile () {}
      }
    }

    const regExp = new RegExp(`^\\s*\\@(!?)(${_.keys(tags).join('|')})(?:\\((.*)\\))?`)
    const ast = new Ast(tags, regExp).parse(statement)

    assert.lengthOf(ast, 1)
    assert.equal(ast[0].lineno, 1)
    assert.equal(ast[0].end.lineno, 6)
    assert.lengthOf(ast[0].childs, 1)
    assert.equal(ast[0].tag, 'component')
  })
})
