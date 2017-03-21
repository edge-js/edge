'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const test = require('japa')
const dedent = require('dedent-js')
const Edge = require('../../src/Edge')
const Presenter = require('../../src/Presenter')
const Globals = require('../../src/Globals')

test.group('Edge', (group) => {
  group.before(() => {
    require('../../test-helpers/transform-tags')(this, require('../../src/Tags'))
  })

  group.beforeEach(() => {
    new Edge().registerViews(null)
    new Edge().registerPresenters(null)
  })

  test('register existing tags on new class instance', (assert) => {
    const edge = new Edge()
    assert.deepEqual(Object.keys(this.tags), Object.keys(edge._tags))
  })

  test('should register all inbuilt globals', (assert) => {
    const edge = new Edge()
    assert.deepEqual(Object.keys(Globals), Object.keys(edge._globals))
  })

  test('throw exception when a tag does not have a tagName', (assert) => {
    const edge = new Edge()
    class DummyTag {}
    const fn = () => edge.tag(new DummyTag())
    assert.throw(fn, 'Cannot register a tag without a tagName, compile and run method')
  })

  test('throw exception when a tag does not have a compile method', (assert) => {
    const edge = new Edge()

    class DummyTag {
      get tagName () {
        return 'foo'
      }
    }

    const fn = () => edge.tag(new DummyTag())
    assert.throw(fn, 'Cannot register a tag without a tagName, compile and run method')
  })

  test('throw exception when a tag does not have a run method', (assert) => {
    const edge = new Edge()

    class DummyTag {
      get tagName () {
        return 'foo'
      }

      compile () {
      }
    }

    const fn = () => edge.tag(new DummyTag())
    assert.throw(fn, 'Cannot register a tag without a tagName, compile and run method')
  })

  test('register tag when all requirements have been satiesfied', (assert) => {
    const edge = new Edge()

    class DummyTag {
      get tagName () {
        return 'foo'
      }
      compile () {}
      run () {}
    }

    edge.tag(new DummyTag())
    assert.equal(edge._tags.foo.name, 'foo')
  })

  test('compile raw string', (assert) => {
    const edge = new Edge()
    const statement = '{{ username }}'
    assert.equal(edge.compileString(statement), dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('render a raw string', (assert) => {
    const edge = new Edge()
    const statement = '{{ username }}'
    assert.equal(edge.renderString(statement, { username: 'virk' }), 'virk\n')
  })

  test('pass instance of base presenter when no presenter has been defined', (assert) => {
    let presenterInstance = null
    const edge = new Edge()
    const statement = '{{ foo() }}'
    edge.global('foo', function () {
      presenterInstance = this.$presenter
    })
    edge.renderString(statement)
    assert.instanceOf(presenterInstance, Presenter)
  })

  test('throw exception when trying to render views without views path', (assert) => {
    const edge = new Edge()
    const output = () => edge.render('hello')
    assert.throw(output, 'Cannot render hello.edge. Make sure to register the views path first')
  })

  test('throw exception when view does not exists', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    edge.registerViews(viewsPath)
    const output = () => edge.render('hello')
    assert.throw(output, `Cannot render hello.edge. Make sure the file exists at ${viewsPath} location`)
  })

  test('render the file from a location synchronously', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    edge.registerViews(viewsPath)
    const output = edge.render('welcome', { username: 'virk' })
    assert.equal(output, 'virk\n')
  })

  test('throw exception when presenters path is not registered', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')

    edge.registerViews(viewsPath)

    const output = () => edge.presenter('Foo').render('welcome', { username: 'virk' })
    assert.throw(output, `Cannot load Foo Presenter. Make sure to register the presenters path first`)
  })

  test('throw exception when presenter does not exists', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    const presentersPath = path.join(__dirname, '../../test-helpers/presenters')

    edge.registerViews(viewsPath)
    edge.registerPresenters(presentersPath)

    const output = () => edge.presenter('Foo').render('welcome', { username: 'virk' })
    assert.throw(output, `Cannot load Foo Presenter. Make sure the file exists at ${presentersPath}`)
  })

  test('pass presenter to the view context when defined', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    const presentersPath = path.join(__dirname, '../../test-helpers/presenters')

    edge.registerViews(viewsPath)
    edge.registerPresenters(presentersPath)

    const output = edge.presenter('User').render('welcome', { username: 'virk' })
    assert.equal(output, 'VIRK\n')
  })

  test('throw proper exception when trying to a render a string with missing presenter', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    const presentersPath = path.join(__dirname, '../../test-helpers/presenters')

    edge.registerViews(viewsPath)
    edge.registerPresenters(presentersPath)

    const output = () => edge.presenter('Foo').renderString('{{ username }}', {username: 'virk'})
    assert.throw(output, `Cannot load Foo Presenter. Make sure the file exists at ${presentersPath} location`)
  })

  test('pass presenter to the raw string context when defined', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    const presentersPath = path.join(__dirname, '../../test-helpers/presenters')

    edge.registerViews(viewsPath)
    edge.registerPresenters(presentersPath)

    const output = edge.presenter('User').renderString('{{ username }}', {username: 'virk'})
    assert.equal(output, 'VIRK\n')
  })

  test('compile the file from a location synchronously', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    edge.registerViews(viewsPath)
    const output = edge.compile('welcome')
    assert.equal(output, dedent`
    module.exports = function () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\\n\`
      return out
    }
    `)
  })

  test('compile the file to a string as a function', (assert) => {
    const edge = new Edge()
    const viewsPath = path.join(__dirname, '../../test-helpers/views')
    edge.registerViews(viewsPath)
    const output = edge.compile('welcome', true)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('compile a string to a string as a function', (assert) => {
    const edge = new Edge()
    const output = edge.compileString('{{ username }}', true)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('share locals to the view before rendering it', (assert) => {
    const edge = new Edge()
    const output = edge.share({ username: 'virk' }).renderString('{{ username }}')
    assert.equal(output, 'virk\n')
  })

  test('render end-2-end template with tag', (assert) => {
    const edge = new Edge()
    const statement = dedent`
    @if(username === 'virk')
      <p> Hello virk </p>
    @endif
    `
    const output = edge.renderString(statement, { username: 'virk' })
    assert.equal(output.trim(), '<p> Hello virk </p>')
  })

  test('should have access to inbuilt globals', (assert) => {
    const edge = new Edge()
    const statement = `{{ size('foo') }}`
    assert.equal(edge.renderString(statement).trim(), '3')
  })
})
