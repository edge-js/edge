'use strict'

const test = require('japa')
const Template = require('../../../src/Template')
const TemplateRunner = require('../../../src/Template/Runner')
const Context = require('../../../src/Context')
const dedent = require('dedent-js')

test.group('Tags | Each ', (group) => {
  group.before(() => {
    require('../../../test-helpers/transform-tags')(this, require('../../../src/Tags'))
  })

  test('parse simple each block to compiled template', (assert) => {
    const statement = dedent`
    @each(user in users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.context.newFrame()
      this.context.loop(this.context.resolve('users'), (user, loop) => {
        this.context.setOnFrame('user', user)
        this.context.setOnFrame('$loop', loop)
      })
      this.context.clearFrame()
      return out
    }).bind(this)()`)
  })

  test('parse each block with content to compiled template', (assert) => {
    const statement = dedent`
    @each(user in users)
      <p> Hello {{ user.username }} </p>
    @endeach
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.context.newFrame()
      this.context.loop(this.context.resolve('users'), (user, loop) => {
        this.context.setOnFrame('user', user)
        this.context.setOnFrame('$loop', loop)
        out += \`  <p> Hello \${this.context.escape(this.context.accessChild(this.context.resolve('user'), ['username']))} </p>\\n\`
      })
      this.context.clearFrame()
      return out
    }).bind(this)()`)
  })

  test('parse nested each blocks', (assert) => {
    const statement = dedent`
    @each(user in users)
      @each(profile in user.profiles)
        <p> Hello {{ user.username }} </p>
      @endeach
    @endeach
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement).split('\n')
    assert.equal(output[3].trim(), `this.context.loop(this.context.resolve('users'), (user, loop) => {`)
    assert.equal(output[7].trim(), `this.context.loop(this.context.accessChild(this.context.resolve('user'), ['profiles']), (profile, loop) => {`)
  })

  test('throw exception when expression is not binary', (assert) => {
    const statement = dedent`
    @each(user, users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <user, users> passed to (each) block')
  })

  test('throw exception when expression operator is not {in}', (assert) => {
    const statement = dedent`
    @each(user == users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'Invalid operator <==> used inside an each block. Make sure to use <in> operator')
  })

  test('throw exception when expression operator is not parsable', (assert) => {
    const statement = dedent`
    @each(user of users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <user of users> passed to (each) block')
  })

  test('parse each block and set index', (assert) => {
    const statement = dedent`
    @each((user, index) in users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = template.compileString(statement)

    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      this.context.newFrame()
      this.context.loop(this.context.resolve('users'), (user, loop) => {
        this.context.setOnFrame('user', user)
        this.context.setOnFrame('$loop', loop)
        this.context.setOnFrame('index', loop.key)
      })
      this.context.clearFrame()
      return out
    }).bind(this)()`)
  })

  test('throw exception when lhs is not a sequence expression', (assert) => {
    const statement = dedent`
    @each((user in index) in users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid left hand side expression <(user in index) in users> used inside an each block')
  })

  test('parse each block with an array', (assert) => {
    const statement = dedent`
    @each(user in users)
      {{ user.username }}
    @endeach
    `
    const template = new Template(this.tags).compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      users: [{username: 'virk'}, {username: 'nikk'}]
    })
    const output = new TemplateRunner(template, {
      context: ctx
    }).run()
    assert.equal(output.trim(), 'virk\n  nikk')
  })

  test('parse each block with an object', (assert) => {
    const statement = dedent`
    @each((ingredient, amount) in food)
      Use {{ amount }} of {{ ingredient }}
    @endeach
    `
    const template = new Template(this.tags).compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      food: {
        ketchup: '5 tbsp',
        mustard: '1 tbsp'
      }
    })
    const output = new TemplateRunner(template, {
      context: ctx
    }).run()
    assert.equal(output.split('\n').map((l) => l.trim()).join('\n'), 'Use ketchup of 5 tbsp\nUse mustard of 1 tbsp\n')
  })

  test('set loop variable with exact info', (assert) => {
    const statement = dedent`
    @each(user in users)
      {{ $loop.index }} {{ $loop.first }} {{ $loop.last }} {{ $loop.total }}
    @endeach
    `
    const template = new Template(this.tags).compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      users: [{username: 'virk'}, {username: 'nikk'}]
    })
    const output = new TemplateRunner(template, {
      context: ctx
    }).run()
    assert.equal(output.trim(), '0 true false 2\n  1 false true 2')
  })

  test('parse else loop with each tag', (assert) => {
    const statement = dedent`
    @each(user in users)
      {{ user.username }}
    @else
      <p> No users found </p>
    @endeach
    `
    const output = new Template(this.tags).compileString(statement)
    assert.equal(output, dedent`
    return (function templateFn () {
      let out = new String()
      if (this.context.hasLength(this.context.resolve('users'))) {
        this.context.newFrame()
        this.context.loop(this.context.resolve('users'), (user, loop) => {
          this.context.setOnFrame('user', user)
          this.context.setOnFrame('$loop', loop)
          out += \`  \${this.context.escape(this.context.accessChild(this.context.resolve('user'), ['username']))}\\n\`
        })
        this.context.clearFrame()
      } else {
        out += \`  <p> No users found </p>\\n\`
      }
      return out
    }).bind(this)()
    `)
  })

  test('parse else loop with each tag', (assert) => {
    const statement = dedent`
    @each(user in users)
      {{ user.username }}
    @else
      <p> No users found </p>
    @endeach
    `
    const template = new Template(this.tags).compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      users: []
    })
    const output = new TemplateRunner(template, {
      context: ctx
    }).run()
    assert.equal(output.trim(), '<p> No users found </p>')
  })
})
