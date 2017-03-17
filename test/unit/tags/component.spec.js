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
const Template = require('../../../src/Template')
const Loader = require('../../../src/Loader')
const dedent = require('dedent-js')
const loader = new Loader(require('path').join(__dirname, '../../../test-helpers/views'))

test.group('Tags | Component ', (group) => {
  group.beforeEach(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse a simple component without any slots', (assert) => {
    const template = new Template(this.tags, {}, loader)
    const statement = dedent`
    @component('components.alert')
      <h2> Hello dude </h2>
    @endcomponent
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        this.context.newFrame()
        this.context.setOnFrame('$slot', \`  <h2> Hello dude </h2>\`)
        out += \`\${this.runTimeRender('components.alert')}\\n\`
        this.context.clearFrame()
      }.bind(this.newContext()))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with props', (assert) => {
    const template = new Template(this.tags, {}, loader)
    const statement = dedent`
    @component('components.alert', username = 'virk')
      <h2> Hello dude </h2>
    @endcomponent
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        this.context.newFrame()
        this.context.setOnFrame('$slot', \`  <h2> Hello dude </h2>\`)
        out += \`\${this.runTimeRender('components.alert')}\\n\`
        this.context.clearFrame()
      }.bind(this.newContext({username: 'virk'})))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with dynamic props', (assert) => {
    const template = new Template(this.tags, {}, loader)
    const statement = dedent`
    @component('components.alert', username = username)
      <h2> Hello dude </h2>
    @endcomponent
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        this.context.newFrame()
        this.context.setOnFrame('$slot', \`  <h2> Hello dude </h2>\`)
        out += \`\${this.runTimeRender('components.alert')}\\n\`
        this.context.clearFrame()
      }.bind(this.newContext({username: this.context.resolve('username')})))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with object as props', (assert) => {
    const template = new Template(this.tags, {}, loader)
    const statement = dedent`
    @component('components.alert', { username })
      <h2> Hello dude </h2>
    @endcomponent
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        this.context.newFrame()
        this.context.setOnFrame('$slot', \`  <h2> Hello dude </h2>\`)
        out += \`\${this.runTimeRender('components.alert')}\\n\`
        this.context.clearFrame()
      }.bind(this.newContext({username: this.context.resolve('username')})))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with dynamic slots', (assert) => {
    const template = new Template(this.tags, {}, loader)
    const statement = dedent`
    @component('components.alert', { username })
      @slot('header')
        <h2> This is the header </h2>
      @endslot

      This is the body
    @endcomponent
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        this.context.newFrame()
        this.context.setOnFrame('$slot', \`
          This is the body\`)
        this.context.setOnFrame('$header', \`    <h2> This is the header </h2>\`)
        out += \`\${this.runTimeRender('components.alert')}\\n\`
        this.context.clearFrame()
      }.bind(this.newContext({username: this.context.resolve('username')})))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with one or more dynamic slots', (assert) => {
    const template = new Template(this.tags, {}, loader)
    const statement = dedent`
    @component('components.alert', { username })
      @slot('header')
        <h2> This is the header </h2>
      @endslot

      @slot('body')
        This is the body
      @endslot
    @endcomponent
    `
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        this.context.newFrame()
        this.context.setOnFrame('$slot', \`\`)
        this.context.setOnFrame('$header', \`    <h2> This is the header </h2>\`)
        this.context.setOnFrame('$body', \`    This is the body\`)
        out += \`\${this.runTimeRender('components.alert')}\\n\`
        this.context.clearFrame()
      }.bind(this.newContext({username: this.context.resolve('username')})))
      return out
    }).bind(this)()
    `)
  })

  test('render template with component', (assert) => {
    const statement = dedent`
    @component('components.alert')
      @slot('header')
        <h2> This is the header </h2>
      @endslot

      @slot('body')
        <p> This is the body <p>
      @endslot
    @endcomponent
    `
    const output = new Template(this.tags, {}, loader).renderString(statement)
    assert.equal(output.trim(), dedent`<div class="header">
          <h2> This is the header </h2>
    </div>

    <div class="body">
          <p> This is the body <p>
    </div>`)
  })

  test('component scope must be isolated', (assert) => {
    const statement = dedent`
    @component('components.user', username = 'virk')
    @endcomponent
    `
    const output = new Template(this.tags, {}, loader).renderString(statement, {
      username: 'nikk'
    })
    assert.equal(output.trim(), '<h2> Hello virk </h2>')
  })

  test('scope current scope values with component', (assert) => {
    const statement = dedent`
    @component('components.user', username = username)
    @endcomponent
    `
    const output = new Template(this.tags, {}, loader).renderString(statement, {
      username: 'nikk'
    })
    assert.equal(output.trim(), '<h2> Hello nikk </h2>')
  })

  test('throw exception when slot name is not a string literal', (assert) => {
    const statement = dedent`
    @component('components.alert')
      @slot('header')
        <h2> This is the header </h2>
      @endslot

      @slot(body)
        <p> This is the body <p>
      @endslot
    @endcomponent
    `
    const output = () => new Template(this.tags, {}, loader).compileString(statement)
    assert.throw(output, 'lineno:6 charno:0 E_INVALID_EXPRESSION: Invalid name <body> passed to slot. Only strings are allowed')
  })

  test('should work fine with nested components', (assert) => {
    const statement = dedent`
    @component('components.alert')
      @slot('body')
        @component('components.user', username = 'joe')
        @endcomponent
      @endslot
    @endcomponent
    `
    const output = new Template(this.tags, {}, loader).renderString(statement)
    assert.deepEqual(
      output.split('\n').map((line) => line.trim()).filter((line) => line.length),
      ['<div class="header">', '</div>', '<div class="body">', '<h2> Hello joe </h2>', '</div>']
    )
  })
})
