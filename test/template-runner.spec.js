'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const test = require('japa')
const dedent = require('dedent')
const _ = require('lodash')
const TemplateRunner = require('../src/Template/Runner')
const TemplateCompiler = require('../src/Template/Compiler')
const Context = require('../src/Context')
const Tags = require('../src/Tags')

test.group('Template Runner', (group) => {
  group.before(() => {
    this.tags = {
      if: {
        name: Tags.ifTag.tagName,
        isBlock: Tags.ifTag.isBlock,
        compile: Tags.ifTag.compile.bind(Tags.ifTag),
        run: Tags.ifTag.run.bind(Tags.ifTag)
      },
      elseif: {
        name: Tags.elseIfTag.tagName,
        isBlock: Tags.elseIfTag.isBlock,
        compile: Tags.elseIfTag.compile.bind(Tags.elseIfTag),
        run: Tags.elseIfTag.run.bind(Tags.elseIfTag)
      },
      else: {
        name: Tags.elseTag.tagName,
        isBlock: Tags.elseTag.isBlock,
        compile: Tags.elseTag.compile.bind(Tags.elseTag),
        run: Tags.elseTag.run.bind(Tags.elseTag)
      },
      each: {
        name: Tags.eachTag.tagName,
        isBlock: Tags.eachTag.isBlock,
        compile: Tags.eachTag.compile.bind(Tags.eachTag),
        run: Tags.eachTag.run.bind(Tags.eachTag)
      }
    }
    _.each(this.tags, (tag) => tag.run(Context))
  })

  test('run a precompiled template', (assert) => {
    const statement = `
    Hello {{ username }}
    `
    const compiled = new TemplateCompiler({}, statement).compile()
    const output = new TemplateRunner(compiled, new Context('', { username: 'virk' })).run()
    assert.equal(output, 'Hello virk\n')
  })

  test('run a precompiled template with conditional', (assert) => {
    const statement = dedent`
    @if(username)
      <p> Hello {{ username }} </p>
    @else
      <p> Hello Anonymous </p>
    @endif
    `
    const compiled = new TemplateCompiler(this.tags, statement).compile()
    const output = new TemplateRunner(compiled, new Context('', { username: 'virk' })).run()
    assert.equal(output, '  <p> Hello virk </p>\n')
  })

  test('run a precompiled template with conditional turning to false', (assert) => {
    const statement = dedent`
    @if(username)
      <p> Hello {{ username }} </p>
    @else
      <p> Hello Anonymous </p>
    @endif
    `
    const compiled = new TemplateCompiler(this.tags, statement).compile()
    const output = new TemplateRunner(compiled, new Context('', {})).run()
    assert.equal(output, '  <p> Hello Anonymous </p>\n')
  })

  test('run each loop', (assert) => {
    const statement = dedent`
    @each(user in users)
      <li> {{ user.username }} </li>
    @endeach
    `
    const compiled = new TemplateCompiler(this.tags, statement).compile()
    const output = new TemplateRunner(compiled, new Context('', {
      users: [{
        username: 'virk'
      }, {
        username: 'nikk'
      }]
    })).run()
    assert.equal(output.trim(), '<li> virk </li>\n  <li> nikk </li>')
  })
})
