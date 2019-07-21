/*
* edge-parser
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import * as test from 'japa'
import * as fs from 'fs-extra'
import { join } from 'path'
import { Compiler } from '../src/Compiler'
import { Loader } from '../src/Loader'
import * as tags from '../src/Tags'

const viewsDir = join(__dirname, 'views')
const loader = new Loader()
loader.mount('default', viewsDir)
const compiler = new Compiler(loader, tags)

test.group('If tag', (group) => {
  group.afterEach(async () => {
    await fs.remove(viewsDir)
  })

  test('raise errors on correct line with if tag', async (assert) => {
    assert.plan(2)

    const templateContent = `Hello everyone!
We are writing a bad if condition

@if(foo bar)
@endif`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.message, 'Unexpected token ')
      assert.equal(error.line, 4)
    }
  })

  test('raise errors when using sequence expression', async (assert) => {
    assert.plan(2)

    const templateContent = `Hello everyone!
We are writing a bad if condition

@if(foo, bar)
@endif`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.line, 4)
      assert.equal(error.message, 'SequenceExpression is not allowed for if tag.')
    }
  })

  test('raise errors when expression was never closed', async (assert) => {
    assert.plan(1)

    const templateContent = `Hello everyone!
We are writing a bad if condition

@if(foo, bar)`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.message, 'Unclosed tag if')
    }
  })
})

test.group('Include', (group) => {
  group.afterEach(async () => {
    await fs.remove(viewsDir)
  })

  test('raise errors on correct line with include tag', async (assert) => {
    assert.plan(1)

    const templateContent = `We are writing a bad include condition
@include(foo bar)`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at (foo:2:13)`)
    }
  })

  test('raise errors when using sequence expression', async (assert) => {
    assert.plan(2)

    const templateContent = `@include('foo', 'bar')`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at (foo:1:9)`)
      assert.equal(error.message, 'SequenceExpression is not allowed for include tag.')
    }
  })
})

test.group('Component', (group) => {
  group.afterEach(async () => {
    await fs.remove(viewsDir)
  })

   test('raise errors when slot name is not defined as a literal', async (assert) => {
    assert.plan(2)

    const templateContent = `@component('bar')

    @slot(hello)
    @endslot

    @endcomponent`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at (foo:3:0)`)
      assert.equal(error.message, 'Identifier is not allowed for slot tag.')
    }
  })

   test('raise errors when slot has more than 2 arguments', async (assert) => {
    assert.plan(2)

    const templateContent = `@component('bar')

    @slot('hello', props, propsAgain)
    @endslot

    @endcomponent`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at (foo:3:0)`)
      assert.equal(error.message, 'Maximum of 2 arguments are allowed for slot tag')
    }
  })

   test('raise errors when slot first argument is not a literal', async (assert) => {
    assert.plan(2)

    const templateContent = `@component('bar')

    @slot(hello, props)
    @endslot

    @endcomponent`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at (foo:3:0)`)
      assert.equal(error.message, 'Identifier is not allowed for slot tag.')
    }
  })

   test('raise errors when slot 2nd argument is not an identifier', async (assert) => {
    assert.plan(2)

    const templateContent = `@component('bar')

    @slot(
      'hello',
      'props'
    )
    @endslot

    @endcomponent`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo', true)
    } catch (error) {
      assert.equal(error.stack.split('\n')[1], `    at (foo:5:6)`)
      assert.equal(error.message, 'Literal is not allowed for slot tag.')
    }
  })
})
