/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { Context, safeValue } from '../src/Context'

test.group('Context', (group) => {
  group.afterEach(() => {
    Context.hydrate()
  })

  test('escape HTML', (assert) => {
    const context = new Context()
    assert.equal(context.escape('<h2> Hello world </h2>'), '&lt;h2&gt; Hello world &lt;/h2&gt;')
  })

  test('do not escape values, which are not string', (assert) => {
    const context = new Context()
    assert.equal(context.escape(22), 22)
  })

  test('do not escape values, which instance of safe value', (assert) => {
    const context = new Context()
    assert.equal(context.escape(safeValue('<h2> Hello world </h2>')), '<h2> Hello world </h2>')
  })

  test('add macros to context', (assert) => {
    Context.macro('upper', (username) => {
      return username.toUpperCase()
    })
    const context = new Context()
    assert.equal(context['upper']('virk'), 'VIRK')
  })

  test('add getters to context', (assert) => {
    Context.getter('username', function username () {
      return 'virk'
    })

    const context = new Context()
    assert.equal(context['username'], 'virk')
  })
})
