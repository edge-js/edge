'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')
const test = require('japa')
const cheerio = require('cheerio')
const Context = require('../../../src/Context')
const Template = require('../../../src/Template')
const Loader = require('../../../src/Loader')
const dedent = require('dedent-js')
const path = require('path')
const loader = new Loader(path.join(__dirname, '../../../test-helpers/views'))

test.group('Tags | Component ', (group) => {
  group.beforeEach(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse a simple component without any slots', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
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
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({$slot: { main: \`  <h2> Hello dude </h2>\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with props', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
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
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: 'virk'},{$slot: { main: \`  <h2> Hello dude </h2>\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with dynamic props', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
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
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: this.context.resolve('username')},{$slot: { main: \`  <h2> Hello dude </h2>\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with object as props', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
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
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: this.context.resolve('username')},{$slot: { main: \`  <h2> Hello dude </h2>\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with dynamic slots', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @component('components.alert', { username })
      @slot('header')
        <h2> This is the header </h2>
      @endslot

      This is the body
    @endcomponent
    `
    const output = template.compileString(statement)
    const slot = `{$slot: { main: \`
    This is the body\`, header: \`    <h2> This is the header </h2>\` } }`

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: this.context.resolve('username')},${slot})))
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple component with one or more dynamic slots', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
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
    const slot = `{$slot: { main: \`\`, header: \`    <h2> This is the header </h2>\`, body: \`    This is the body\` } }`

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: this.context.resolve('username')},${slot})))
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
    const output = new Template(this.tags, {}, {}, loader).renderString(statement)

    assert.equal(output.trim(), dedent`
      <div class="header">
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
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
      username: 'nikk'
    })
    assert.equal(output.trim(), '<h2> Hello virk </h2>')
  })

  test('scope current scope values with component', (assert) => {
    const statement = dedent`
    @component('components.user', username = username)
    @endcomponent
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
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
    const output = () => new Template(this.tags, {}, {}, loader).compileString(statement)
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
    const output = new Template(this.tags, {}, {}, loader).renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('.body').html().trim(), '<h2> Hello joe </h2>')
  })

  test('pass multiple props to a component', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @component('components.user', username = 'virk', age = 22)
    @endcomponent
    `
    const output = template.renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('h2').text().trim(), 'Hello virk')
    assert.equal($('p').text().trim(), '22')
  })

  test('component slots should have access to parent template scope', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @component('components.alert')
      <h2>{{ username }}</h2>
    @endcomponent
    `
    const output = template.renderString(statement, {
      username: 'virk'
    })
    const $ = cheerio.load(output)
    assert.equal($('h2').text(), 'virk')
  })

  test('include inside the components', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @component('components.alert')
      @slot('body')
        @include('includes.user-name')
      @endslot
    @endcomponent
    `
    const output = template.renderString(statement, {
      username: 'virk'
    })
    const $ = cheerio.load(output)
    assert.equal($('h2').text().trim(), 'virk')
  })

  test('include component inside component', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @component('components.modal')
      @slot('header')
        Header
      @endslot

      @slot('body')
        Body
      @endslot
    @endcomponent
    `
    const output = template.renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('.header').text().trim(), 'Header')
    assert.equal($('.body').text().trim(), 'Body')
  })

  test('deeply nested tags inside slots', (assert) => {
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @component('components.modal')
      @slot('body')
        @each(rows in rowsGroup)
          <div class="col-lg-6">
            @each(row in rows)
              <h4> {{ row.heading }} </h4>
              <p> {{ row.body }} </p>
            @endeach
          </div>
        @else
          <h2> Nothing found </h2>
        @endeach
      @endslot
    @endcomponent
    `
    this.tags.each.run(Context)
    const rows = [{heading: 'foo', body: 'foo'}, {heading: 'bar', body: 'bar'}]
    const output = template.renderString(statement, {
      rowsGroup: _.chunk(rows, 1)
    })
    const $ = cheerio.load(output)
    assert.equal($('.col-lg-6 h4').length, 2)
    assert.equal($('.col-lg-6 p').length, 2)
    assert.equal($('.col-lg-6:first-child h4').text().trim(), 'foo')
    assert.equal($('.col-lg-6:last-child h4').text().trim(), 'bar')
  })

  test('pass presenter to component', (assert) => {
    loader.presentersPath = path.join(__dirname, '../../../test-helpers/presenters')
    const template = new Template(this.tags, {}, {}, loader)
    const statement = dedent`
    @!component('components.user', presenter = 'User', username = 'virk')
    `
    this.tags.each.run(Context)
    const output = template.renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('h2').text().trim(), 'Hello VIRK')
  })
})
