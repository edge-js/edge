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
const Context = require('../../src/Context')
const Presenter = require('../../src/Presenter')

test.group('Context', () => {
  test('resolve value from presenter data object', (assert) => {
    const presenter = new Presenter({
      name: 'virk'
    })

    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.resolve('name'), 'virk')
  })

  test('resolve nested values from presenter data object', (assert) => {
    const presenter = new Presenter({
      profile: {
        name: 'virk'
      }
    })

    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.resolve('profile.name'), 'virk')
  })

  test('give preference to presenter over it\'s data object', (assert) => {
    const presenter = new Presenter({
      name: 'virk'
    })
    presenter.name = 'nikk'
    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.resolve('name'), 'nikk')
  })

  test('access nested values from data via accessChild', (assert) => {
    const presenter = new Presenter({
      profile: {
        name: 'virk'
      }
    })

    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.accessChild(ctx.resolve('profile'), ['name']), 'virk')
  })

  test('access deeply nested values from data', (assert) => {
    const presenter = new Presenter({
      loggedUser: {
        profile: {
          name: 'virk'
        }
      }
    })

    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.accessChild(ctx.resolve('loggedUser'), ['profile', 'name']), 'virk')
  })

  test('access deeply nested values from array', (assert) => {
    const presenter = new Presenter({
      loggedUser: {
        profiles: [{
          name: 'virk'
        }]
      }
    })

    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.accessChild(ctx.resolve('loggedUser'), ['profiles', '0', 'name']), 'virk')
  })

  test('push values to frame', (assert) => {
    const ctx = new Context('user.edge', {})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    assert.deepEqual(ctx._frames, [{name: 'virk'}])
  })

  test('clear values from frame', (assert) => {
    const ctx = new Context('user.edge', {})
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.clearFrame()
    assert.deepEqual(ctx._frames, [])
  })

  test('give priority to recent frame over presenter object', (assert) => {
    const presenter = new Presenter({name: 'nikk'})
    const ctx = new Context('user.edge', presenter)
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    assert.equal(ctx.resolve('name'), 'virk')
  })

  test('give priority to recent frame over data object with multiple frames', (assert) => {
    const presenter = new Presenter({name: 'nikk'})
    const ctx = new Context('user.edge', presenter)
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.newFrame()
    ctx.setOnFrame('name', 'james')
    assert.equal(ctx.resolve('name'), 'james')
  })

  test('access values on the parent context', (assert) => {
    const presenter = new Presenter({name: 'nikk'})
    const ctx = new Context('user.edge', presenter)
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.newFrame()
    ctx.setOnFrame('name', 'james')
    assert.equal(ctx.resolve('$parent.name'), 'virk')
  })

  test('access values on the deeply parent context', (assert) => {
    const presenter = new Presenter({name: 'nikk'})
    const ctx = new Context('user.edge', presenter)
    ctx.newFrame()
    ctx.setOnFrame('name', 'virk')
    ctx.newFrame()
    ctx.setOnFrame('name', 'james')
    ctx.newFrame()
    ctx.setOnFrame('name', 'jamie')
    assert.equal(ctx.resolve('$parent.$parent.name'), 'virk')
  })

  test('call a global function', (assert) => {
    let countedCalled = false
    const ctx = new Context('user.edge', {name: 'nikk'}, {
      count () {
        countedCalled = true
      }
    })
    ctx.callFn('count')
    assert.equal(countedCalled, true)
  })

  test('call a global function with arguments', (assert) => {
    let args = null
    const ctx = new Context('user.edge', {name: 'nikk'}, {
      count () {
        args = arguments
      }
    })
    ctx.callFn('count', ['users'])
    assert.equal(args[0], 'users')
  })

  test('resolve value from globals when does not exists on data object', (assert) => {
    const presenter = new Presenter({})
    const ctx = new Context('user.edge', presenter, {
      url: 'foo'
    })
    ctx.resolve('url', 'foo')
  })

  test('return empty string when unable to resolve value', (assert) => {
    const presenter = new Presenter({})
    const ctx = new Context('user.edge', presenter)
    ctx.resolve('name', '')
  })

  test('throw error when unable to call fn', (assert) => {
    const presenter = new Presenter({})
    const ctx = new Context('user.edge', presenter)
    const fn = () => ctx.callFn('greet')
    assert.throw(fn, 'Cannot call function greet from user.edge view')
  })

  test('escape html', (assert) => {
    const presenter = new Presenter({})
    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.escape('<h2> hello </h2>'), '&lt;h2&gt; hello &lt;/h2&gt;')
  })

  test('add a value to context prototype via macro', (assert) => {
    const presenter = new Presenter({})
    Context.macro('greet', 'hello')
    const ctx = new Context('user.edge', presenter)
    assert.equal(ctx.greet, 'hello')
  })

  test('functions should have access to context instance', (assert) => {
    let countInstance = null
    const ctx = new Context('user.edge', {name: 'nikk'}, {
      count () {
        countInstance = this
      }
    })
    ctx.callFn('count')
    assert.instanceOf(countInstance, Context)
    assert.deepEqual(countInstance, ctx)
  })
})
