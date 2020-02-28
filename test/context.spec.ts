/*
* edge
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import test from 'japa'
import { Context } from '../src/Context'
import { Presenter } from '../src/Presenter'

test.group('Context', (group) => {
  group.afterEach(() => {
    Context.hydrate()
  })

  test('resolve data from presenter state', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }
    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.resolve('username'), 'virk')
  })

  test('give preference to presenter values over data', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    class MyPresenter extends Presenter {
      get fullName () {
        return 'Aman virk'
      }
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.resolve('fullName'), 'Aman virk')
  })

  test('give preferences to frames over presenter', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.setOnFrame('username', 'foo')

    assert.equal(context.resolve('username'), 'foo')
  })

  test('allow nested frames', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.setOnFrame('user', { username: 'virk' })

    context.newFrame()
    context.setOnFrame('post', { title: 'Adonis 101' })

    assert.deepEqual(context.resolve('post'), { title: 'Adonis 101' })
    context.removeFrame()
    assert.isUndefined(context.resolve('post'))

    assert.deepEqual(context.resolve('user'), { username: 'virk' })
    context.removeFrame()
    assert.isUndefined(context.resolve('user'))
  })

  test('return value from sharedState when doesnt exists anywhere', (assert) => {
    const sharedState = {
      url: '/',
    }

    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.setOnFrame('user', { username: 'virk' })
    assert.equal(context.resolve('url'), '/')
  })

  test('escape HTML', (assert) => {
    const sharedState = {
    }

    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.escape('<h2> Hello world </h2>'), '&lt;h2&gt; Hello world &lt;/h2&gt;')
  })

  test('do not escape values, which are not string', (assert) => {
    const sharedState = {
    }

    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.escape(22), 22)
  })

  test('give priority to the recent frame', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.setOnFrame('user', { username: 'virk' })

    context.newFrame()
    context.setOnFrame('user', { username: 'nikk' })

    assert.deepEqual(context.resolve('user'), { username: 'nikk' })
    context.removeFrame()

    assert.deepEqual(context.resolve('user'), { username: 'virk' })
    context.removeFrame()
    assert.isUndefined(context.resolve('user'))
  })

  test('add macros to context', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    Context.macro('upper', function username (username) {
      return username.toUpperCase()
    })

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context['upper']('virk'), 'VIRK')
  })

  test('add getters to context', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    Context.getter('username', function username () {
      return 'virk'
    })

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context['username'], 'virk')
  })

  test('functions should retain access to this', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    class MyPresenter extends Presenter {
      public getUsername () {
        return this.state.username
      }
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.resolve('getUsername')(), 'virk')
  })

  test('functions should retain access to state via this', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
      getUsername () {
        return this.username
      },
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.resolve('getUsername')(), 'virk')
  })

  test('shared state functions should retain access to state via this', (assert) => {
    const sharedState = {
      username: 'virk',
      getUsername () {
        return this.username
      },
    }

    const data = {
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    assert.equal(context.resolve('getUsername')(), 'virk')
  })

  test('frame functions should retain access to context', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)
    context.newFrame()
    context.setOnFrame('getUsername', function () {
      return this.resolve('username')
    })
    assert.equal(context.resolve('getUsername')(), 'virk')
    context.removeFrame()
  })

  test('mutate values inside presenter state', (assert) => {
    const sharedState = {
    }

    const data = {
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    context.set('username', 'virk')
    assert.equal(context.presenter.state.username, 'virk')
  })

  test('mutate nested values inside the presenter state', (assert) => {
    const sharedState = {
    }

    const data = {
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    context.set('user.username', 'virk')
    assert.equal(context.presenter.state.user.username, 'virk')
  })

  test('mutate value inside frame when inside frame context', (assert) => {
    const sharedState = {
    }

    const data = {
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.set('username', 'virk')
    assert.equal(context['_frames'][0].username, 'virk')
  })

  test('mutate value to the latest frame', (assert) => {
    const sharedState = {
    }

    const data = {
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.set('username', 'virk')
    context.newFrame()
    context.set('username', 'nikk')

    assert.equal(context.resolve('username'), 'nikk')
    context.removeFrame()

    assert.equal(context.resolve('username'), 'virk')
    context.removeFrame()

    assert.isUndefined(context.resolve('username'))
  })

  test('mutate value inside to the presenter state when value already exists there', (assert) => {
    const sharedState = {
    }

    const data = {
      username: 'virk',
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.set('username', 'nikk')
    assert.deepEqual(context['_frames'][0], {})
    assert.equal(context['presenter'].state.username, 'nikk')
  })

  test('raise error when trying to call setOnFrame without calling newFrame', (assert) => {
    const sharedState = {
    }

    const data = {
      username: 'virk',
    }

    class MyPresenter extends Presenter {
    }

    const presenter = new MyPresenter(data)
    const context = new Context(presenter, sharedState)

    const fn = () => context.setOnFrame('username', 'nikk')
    assert.throw(fn, 'Make sure to call {newFrame} before calling {setOnFrame}')
  })

  test('return template state', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.deepEqual(context.resolve('$state'), {
      username: 'virk',
    })
  })

  test('return template state when frames are presenter', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.setOnFrame('username', 'foo')
    assert.deepEqual(context.resolve('$state'), {
      username: 'foo',
    })
  })

  test('return template state when shared state is presenter', (assert) => {
    const sharedState = {
      username: 'nikk',
      age: 22,
    }

    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    assert.deepEqual(context.resolve('$state'), {
      username: 'virk',
      age: 22,
    })
  })

  test('return template state nested frames are present', (assert) => {
    const sharedState = {}
    const data = {
      username: 'virk',
    }

    const presenter = new Presenter(data)
    const context = new Context(presenter, sharedState)

    context.newFrame()
    context.setOnFrame('user', { username: 'virk' })

    context.newFrame()
    context.setOnFrame('post', { title: 'Adonis 101' })

    assert.deepEqual(context.resolve('$state'), {
      username: 'virk',
      user: {
        username: 'virk',
      },
      post: {
        title: 'Adonis 101',
      },
    })
  })
})
