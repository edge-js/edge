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
const Context = require('../src/Context')

test.group('Context', () => {
  test('resolve value from data', (assert) => {
    const ctx = new Context({
      name: 'virk'
    })
    assert.equal(ctx.resolve('name'), 'virk')
  })

  test('resolve nested values from data', (assert) => {
    const ctx = new Context({
      profile: {
        name: 'virk'
      }
    })
    assert.equal(ctx.resolve('profile.name'), 'virk')
  })

  test('access nested values from data', (assert) => {
    const ctx = new Context({
      profile: {
        name: 'virk'
      }
    })
    assert.equal(ctx.accessChild(ctx.resolve('profile'), ['name']), 'virk')
  })

  test('access deeply nested values from data', (assert) => {
    const ctx = new Context({
      loggedUser: {
        profile: {
          name: 'virk'
        }
      }
    })
    assert.equal(ctx.accessChild(ctx.resolve('loggedUser'), ['profile', 'name']), 'virk')
  })

  test('access deeply nested values from array', (assert) => {
    const ctx = new Context({
      loggedUser: {
        profiles: [{
          name: 'virk'
        }]
      }
    })
    assert.equal(ctx.accessChild(ctx.resolve('loggedUser'), ['profiles', '0', 'name']), 'virk')
  })

  test('push values to frame', (assert) => {
    const ctx = new Context({})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    assert.deepEqual(ctx._frames, [{name: 'virk'}])
  })

  test('clear values from frame', (assert) => {
    const ctx = new Context({})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.clearFrame()
    assert.deepEqual(ctx._frames, [])
  })

  test('give priority to recent frame over data object', (assert) => {
    const ctx = new Context({name: 'nikk'})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    assert.equal(ctx.resolve('name'), 'virk')
  })

  test('give priority to recent frame over data object with multiple frames', (assert) => {
    const ctx = new Context({name: 'nikk'})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.newFrame()
    ctx.setOnFrame('name', 'james')
    assert.equal(ctx.resolve('name'), 'james')
  })

  test('access values on the parent context', (assert) => {
    const ctx = new Context({name: 'nikk'})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.newFrame()
    ctx.setOnFrame('name', 'james')
    assert.equal(ctx.resolve('parent.name'), 'virk')
  })

  test('access values on the deeply parent context', (assert) => {
    const ctx = new Context({name: 'nikk'})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.newFrame()
    ctx.setOnFrame('name', 'james')
    ctx.newFrame()
    ctx.setOnFrame('name', 'jamie')
    assert.equal(ctx.resolve('parent.parent.name'), 'virk')
  })

  test('call a global function', (assert) => {
    let countedCalled = false
    const ctx = new Context({name: 'nikk'}, {
      count () {
        countedCalled = true
      }
    })
    ctx.callFn('count')
    assert.equal(countedCalled, true)
  })

  test('call a global function with arguments', (assert) => {
    let args = null
    const ctx = new Context({name: 'nikk'}, {
      count () {
        args = arguments
      }
    })
    ctx.callFn('count', ['users'])
    assert.equal(args[0], 'users')
  })

  test('resolve value from globals when does not exists on data object', (assert) => {
    let args = null
    const ctx = new Context({}, {name: 'virk'})
    assert.equal(ctx.resolve('name'), 'virk')
  })
})
