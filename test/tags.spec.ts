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

test.group('If tag', () => {
  test('raise errors on correct line with if tag', async (assert) => {
    assert.plan(1)

    const templateContent = `Hello everyone!
We are writing a bad if condition

@if(foo bar)
@endif`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo')
    } catch (error) {
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
      compiler.compile('foo')
    } catch (error) {
      assert.equal(error.line, 4)
      assert.equal(error.message, 'E_UNALLOWED_EXPRESSION: SequenceExpression is not allowed for if tag\n> More details: https://err.sh/poppinss/edge-errors/E_UNALLOWED_EXPRESSION')
    }
  })

  test('raise errors when expression was never closed', async (assert) => {
    assert.plan(1)

    const templateContent = `Hello everyone!
We are writing a bad if condition

@if(foo, bar)`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo')
    } catch (error) {
      assert.equal(error.message, 'Unclosed tag if')
    }
  })
})

test.group('Include', () => {
  test('raise errors on correct line with include tag', async (assert) => {
    assert.plan(1)

    const templateContent = `We are writing a bad include condition
@include(foo bar)`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo')
    } catch (error) {
      assert.equal(error.line, 2)
    }
  })

  test('raise errors when using sequence expression', async (assert) => {
    assert.plan(2)

    const templateContent = `@include('foo', 'bar')`

    await fs.outputFile(join(viewsDir, 'foo.edge'), templateContent)
    try {
      compiler.compile('foo')
    } catch (error) {
      assert.equal(error.line, 1)
      assert.equal(error.message, 'E_UNALLOWED_EXPRESSION: SequenceExpression is not allowed for if tag\n> More details: https://err.sh/poppinss/edge-errors/E_UNALLOWED_EXPRESSION')
    }
  })
})
