const test = require('japa')
const Template = require('../../../src/Template')
const Loader = require('../../../src/Loader')
const dedent = require('dedent-js')
const loader = new Loader(require('path').join(__dirname, '../../../test-helpers/views'))

test.group('Tags | Mustache', (group) => {
  group.before(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse simple mustache statement', (assert) => {
    const statement = dedent`
    @mustache('virk')
    `
    const output = new Template(this.tags, {}, {}, loader).compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape('virk')}\`
      return out
    }).bind(this)()
    `)
  })

  test('parse template with dynamic value', (assert) => {
    const statement = dedent`
    @mustache(username)
    `
    const output = new Template(this.tags, {}, {}, loader).compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      out += \`\${this.context.escape(this.context.resolve('username'))}\`
      return out
    }).bind(this)()
    `)
  })

  test('render template with dynamic include value', (assert) => {
    const statement = dedent`
    @mustache(username)
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
      username: 'virk'
    })
    assert.equal(output.trim(), 'virk')
  })

  test('render template with a shorthand if statement', (assert) => {
    const statement = dedent`
    @mustache(username === 'virk' ? username : 'guest')
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
      username: 'virk'
    })
    assert.equal(output.trim(), 'virk')
  })

  test('render template with native method calls on the value', (assert) => {
    const statement = dedent`
    @mustache(username.toUpperCase())
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
      username: 'virk'
    })
    assert.equal(output.trim(), 'VIRK')
  })

  test('render template with call to a global method', (assert) => {
    const statement = dedent`
    @mustache(formatMessage(
      'cart.total',
      { currency: 'usd', style: 'currency' }
    ))
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
      formatMessage: function (key, options) {
        return `${key} ${options.currency} ${options.style}`
      }
    })
    assert.equal(output.trim(), 'cart.total usd currency')
  })

  test('do not throw exception when value is not defined', (assert) => {
    const statement = dedent`
    @mustache(username)
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {})
    assert.equal(output.trim(), '')
  })

  test('ecape html', (assert) => {
    const statement = dedent`
    @mustache('<p> Hello </p>')
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {})
    assert.equal(output.trim(), '&lt;p&gt; Hello &lt;/p&gt;')
  })

  test('do not escape html when 2nd param is true', (assert) => {
    const statement = dedent`
    @mustache('<p> Hello </p>', true)
    `
    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {})
    assert.equal(output.trim(), '<p> Hello </p>')
  })

  test('do not escape html with shorthand if statement', (assert) => {
    const statement = dedent`
    @mustache(
      username ? '<p> Hello ' + username + ' </p>' : '<p> Hello guest </p>',
      true
    )
    `

    const output = new Template(this.tags, {}, {}, loader).renderString(statement, {
      username: 'virk'
    })

    assert.equal(output.trim(), '<p> Hello virk </p>')
  })
})
