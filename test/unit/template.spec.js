'use strict'

/*
 * adonis-edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const path = require('path')
const test = require('japa')
const cheerio = require('cheerio')
const dedent = require('dedent-js')
const Template = require('../../src/Template')
const TemplateCompiler = require('../../src/Template/Compiler')
const Loader = require('../../src/Loader')
const Context = require('../../src/Context')
const cache = require('../../src/Cache')

test.group('Template Compiler', (group) => {
  group.before(() => {
    require('../../test-helpers/transform-tags')(this, require('../../src/Tags'))
  })

  test('parse a simple template string without tags', (assert) => {
    const statement = `{{ username }}`
    const template = new Template({}, {})
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\\n\`
      return out
    }).bind(this)()
    `)
  })

  test('parse a simple template string with tags', (assert) => {
    const statement = dedent`
    @if(username)
      {{ username }}
    @endif
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (this.context.resolve('username')) {
        out += \`  \${this.context.escape(this.context.resolve('username'))}\\n\`
      }
      return out
    }).bind(this)()
    `)
  })

  test('report error with correct lineno when string has error', (assert) => {
    const statement = dedent`
    @if(username, age)
      {{ username }}
    @endif
    `
    const template = new Template(this.tags, {})
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <username, age> passed to (if) block')
  })

  test('parse a template by reading it via loader', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.compile('ifView')
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (this.context.resolve('username')) {
        out += \`  \${this.context.escape(this.context.resolve('username'))}\\n\`
      }
      return out
    }).bind(this)()
    `)
  })

  test('report error with correct lineno when file has error', (assert) => {
    assert.plan(2)
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, {}, loader)
    const output = () => template.compile('ifErrorView')
    try {
      output()
    } catch (error) {
      assert.equal(error.message, 'E_INVALID_EXPRESSION: Invalid expression <username, age> passed to (if) block')
      assert.equal(error.stack.split('\n')[1].trim(), `at (${loader.getViewPath('ifErrorView.edge')}:8:0)`)
    }
  })

  test('do not parse layout when it is not in the first line', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    Hello world
    @layout('layouts.master')
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement)
    assert.equal(output, dedent`
    Hello world
    @layout('layouts.master')

    `)
  })

  test('report error when right view name when partial fails to compile', (assert) => {
    assert.plan(2)
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @include('includes.bad-partial')
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    try {
      template.renderString(statement)
    } catch (error) {
      assert.equal(error.message, `E_INVALID_EXPRESSION: Invalid expression <'user', 'age'> passed to (if) block`)
      assert.equal(error.stack.split('\n')[1].trim(), `at (${loader.getViewPath('includes/bad-partial.edge')}:2:0)`)
    }
  })

  test('parse a template with multiline tags', (assert) => {
    const statement = dedent`
    @!component(
      'components.alert',
      username = 'virk'
    )
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: 'virk'},{$slot: { main: \`\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a template with multiline tags with closing bracket net to content', (assert) => {
    const statement = dedent`
    @!component(
      'components.alert',
      username = 'virk')
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: 'virk'},{$slot: { main: \`\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a template with multiline tags with first line having partial content', (assert) => {
    const statement = dedent`
    @!component('components.alert',
      { username: 'virk' }
    )
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: 'virk'},{$slot: { main: \`\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a template with multiline tags with comments in between', (assert) => {
    const statement = dedent`
    @!component('components.alert',
      {{-- Data to be passed --}}
      { username: 'virk' }
    )
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: 'virk'},{$slot: { main: \`\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('parse a template with multiline tags with comments next to content', (assert) => {
    const statement = dedent`
    @!component('components.alert',
      { username: 'virk' } {{-- Data to be passed --}}
    )
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.isolate(function () {
        out += \`\${this.renderWithContext('components.alert')}\`
      }.bind(this.newContext({username: 'virk'},{$slot: { main: \`\` } })))
      return out
    }).bind(this)()
    `)
  })

  test('work fine with multiline if clause', (assert) => {
    const statement = dedent`
    @if(
      username === 'virk'
      && age === 22
      && isAdmin
    )
      <p> You are super user </p>
    @endif
    `

    const inlineStatement = dedent`
      @if(username === 'virk' && age === 22 && isAdmin)
        <p> You are super user </p>
      @endif
      `

    const template = new Template(this.tags, {})
    const output = template.compileString(statement)
    const inlineOutput = template.compileString(inlineStatement)
    assert.equal(output, inlineOutput)
  })

  test('trim component name white space', (assert) => {
    const statement = `
    <html>
      <body>
        @include('content') 
      </body>
    </html>
    `
    const template = new Template(this.tags, {})
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`<html>\\n\`
      out += \`      <body>\\n\`
      out += \`\${this.runTimeRender('content')}\`
      out += \`      </body>\\n\`
      out += \`    </html>\\n\`
      return out
    }).bind(this)()
    `)
  })
})

test.group('Template Runner', () => {
  test('render a template by loading it from file', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.render('welcome', { username: 'virk' })
    assert.equal(output.trim(), 'virk')
  })

  test('render a template from string', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString('{{ username }}', { username: 'virk' })
    assert.equal(output.trim(), 'virk')
  })

  test('make use of presenter when rendering the view', (assert) => {
    const loader = new Loader(
      path.join(__dirname, '../../test-helpers/views'),
      path.join(__dirname, '../../test-helpers/presenters')
    )
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.presenter('User').renderString('{{ username }}', { username: 'virk' })
    assert.equal(output.trim(), 'VIRK')
  })

  test('pass locals when rendering the view', (assert) => {
    const loader = new Loader(
      path.join(__dirname, '../../test-helpers/views'),
      path.join(__dirname, '../../test-helpers/presenters')
    )
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.share({username: 'virk'}).renderString('{{ username }}')
    assert.equal(output.trim(), 'virk')
  })

  test('ignore everything not inside sections when a layout is defined', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.master')
    <h2> Hello world </h2>
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('h2').length, 0)
  })

  test('replace layout section value with template section', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.master')
    @section('content')
      <h2> Hello world </h2>
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('h2').length, 1)
    assert.equal($('p').length, 0)
    assert.equal($('h2').text().trim(), 'Hello world')
  })

  test('throw exception when a section is called twice', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.master')
    @section('content')
      <h2> Hello world </h2>
    @endsection

    @section('content')
      <h2> Hello world </h2>
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = () => template.renderString(statement)
    assert.throw(output, `lineno:6 charno:1 E_INVALID_EXPRESSION: Section <@section('content')> has been called multiple times. A section can only be called once`)
  })

  test('throw exception when a section name is not a literal', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.master')
    @section(content)
      <h2> Hello world </h2>
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = () => template.renderString(statement)
    assert.throw(output, `lineno:2 charno:0 E_INVALID_EXPRESSION: Invalid expression <content> passed to a section. Make sure section name must be a valid string`)
  })

  test('throw exception when layout file has invalid section name', (assert) => {
    assert.plan(2)
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.invalid//.master')
    @section('content')
      <h2> Hello world </h2>
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    try {
      template.renderString(statement)
    } catch (error) {
      assert.equal(error.message, `E_INVALID_EXPRESSION: Invalid expression <content> passed to (section) block`)
      assert.equal(error.stack.split('\n')[1].trim(), `at (${loader.getViewPath('layouts/invalid.master.edge')}:8:0)`)
    }
  })

  test('define dynamic layout name', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout(masterLayout)
    @section('content')
      <h2> Hello world </h2>
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement, {
      masterLayout: 'layouts.master'
    })
    const $ = cheerio.load(output)
    assert.equal($('h2').length, 1)
    assert.equal($('p').length, 0)
    assert.equal($('h2').text().trim(), 'Hello world')
  })

  test('append layout section value with template section when super keyword is used', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.master')
    @section('content')
      @super
      <h2> Hello world </h2>
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement)
    const $ = cheerio.load(output)
    assert.equal($('h2').length, 1)
    assert.equal($('p').length, 1)
    assert.equal($('h2').text().trim(), 'Hello world')
  })

  test('do not execute default content when section is overridden', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    @layout('layouts.user')
    @section('content')
    @endsection
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    template.renderString(statement)
  })

  test('remove comments on render', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    {{-- Render {{ username }} when exists --}}
    @if(username)
      <h2> Hey {{ username }} </h2>
    @endif
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement, { username: 'virk' })
    assert.equal(output.trim(), dedent`
      <h2> Hey virk </h2>
    `)
  })

  test('remove block comments on render', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    {{--
      Render {{ username }} when exists
    --}}
    @if(username)
      <h2> Hey {{ username }} </h2>
    @endif
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement, { username: 'virk' })
    assert.equal(output.trim(), dedent`
      <h2> Hey virk </h2>
    `)
  })

  test('add template to cache after compile', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {cache: true}, {}, loader)
    template.compile('welcome')
    assert.isDefined(cache._items['welcome.edge'])
  })

  test('rendering a view multiple times should get it from the cache', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {cache: true}, {}, loader)
    template.compile('welcome')
    const existingCompile = TemplateCompiler.prototype.compile
    TemplateCompiler.prototype.compile = function () {
      throw new Error('Template should have been fetched from cache')
    }
    template.compile('welcome')
    TemplateCompiler.prototype.compile = existingCompile
  })

  test('runtime render should update the partial name when inside a partial', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    {{ outputViewName() }}
    @include('includes.generic')
    {{ outputViewName() }}
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement, {
      outputViewName () {
        return this.$viewName
      }
    })
    assert.equal(output.trim(), dedent`
    raw string
    includes/generic.edge
    raw string
    `)
  })

  test('runtime render should update the partial name when nested includes', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    {{ outputViewName() }}
    @include('includes.nested')
    {{ outputViewName() }}
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement, {
      outputViewName () {
        return this.$viewName
      }
    })
    assert.equal(output.trim(), dedent`
    raw string
    includes/nested.edge
    includes/generic.edge
    includes/nested.edge
    raw string
    `)
  })

  test('runtime render of components should update the view name', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const statement = dedent`
    {{ outputViewName() }}
    @!component('components.generic', { outputViewName })
    {{ outputViewName() }}
    `

    this.tags.section.run(Context)
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString(statement, {
      outputViewName () {
        return this.$viewName
      }
    })
    assert.equal(output.trim(), dedent`
    raw string
    components/generic.edge
    raw string
    `)
  })

  test('calling escape after safe should not escape the content', (assert) => {
    const loader = new Loader(path.join(__dirname, '../../test-helpers/views'))
    const template = new Template(this.tags, {}, {}, loader)
    const output = template.renderString('{{ someHtml() }}', {
      someHtml () {
        return this.safe('<h2> Hello </h2>')
      }
    })
    assert.equal(output.trim(), '<h2> Hello </h2>')
  })
})
