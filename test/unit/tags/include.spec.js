'use strict'

const test = require('japa')
const Template = require('../../../src/Template')
const Loader = require('../../../src/Loader')
const dedent = require('dedent-js')
const loader = new Loader(require('path').join(__dirname, '../../../test-helpers/views'))

test.group('Tags | Include ', (group) => {
  group.before(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse simple include statement', (assert) => {
    const statement = dedent`
    @include('includes.users.edge')
    `
    const output = new Template(this.tags, {}, loader).compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.runTimeRender('includes.users.edge')}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('parse template with dynamic include value', (assert) => {
    const statement = dedent`
    @include(user.profile)
    `
    const output = new Template(this.tags, {}, loader).compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.runTimeRender(this.context.accessChild(this.context.resolve('user'), ['profile']))}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('render template with dynamic include value', (assert) => {
    const statement = dedent`
    @include(usersPartial)
    `
    const output = new Template(this.tags, {}, loader).renderString(statement, {
      usersPartial: 'includes.users'
    })
    assert.equal(output.trim(), '<h2> Hello </h2>')
  })

  test('render template when if is truthy', (assert) => {
    const statement = dedent`
    @if(username)
      @include(usersPartial)
    @endif
    `
    const output = new Template(this.tags, {}, loader).renderString(statement, {
      usersPartial: 'includes.users',
      username: 'virk'
    })
    assert.equal(output.trim(), '<h2> Hello </h2>')
  })

  test('do not include when if is not truthy', (assert) => {
    const statement = dedent`
    @if(username)
      @include(usersPartial)
    @endif
    `
    const output = new Template(this.tags, {}, loader).renderString(statement, {
      usersPartial: 'includes.users'
    })
    assert.equal(output.trim(), '')
  })

  test('work fine with nested includes', (assert) => {
    const statement = `@include('includes.user-profile')`

    const template = new Template(this.tags, {}, loader)
    const output = template.renderString(statement, { username: 'Foo' })
    assert.equal(output.trim(), dedent`<h1> User Profile </h1>
    <h2> Foo </h2>
    `)
  })
})
