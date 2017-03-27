'use strict'

const _ = require('lodash')
const test = require('japa')
const path = require('path')
const Template = require('../../../src/Template')
const TemplateRunner = require('../../../src/Template/Runner')
const Context = require('../../../src/Context')
const Loader = require('../../../src/Loader')
const dedent = require('dedent-js')
const loader = new Loader(path.join(__dirname, '../../../test-helpers/views'))

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
      const payload_1 = this.context.resolve('users')
      this.context.newFrame()
      this.context.loop(payload_1, (user, loop) => {
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
      const payload_1 = this.context.resolve('users')
      this.context.newFrame()
      this.context.loop(payload_1, (user, loop) => {
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
    assert.equal(output[4].trim(), `this.context.loop(payload_1, (user, loop) => {`)
    assert.equal(output[7].trim(), `const payload_2 = this.context.accessChild(this.context.resolve('user'), ['profiles'])`)
    assert.equal(output[9].trim(), `this.context.loop(payload_2, (profile, loop) => {`)
  })

  test('throw exception when expression is not binary', (assert) => {
    const statement = dedent`
    @each(user.users)
    @endeach
    `
    const template = new Template(this.tags)
    const output = () => template.compileString(statement)
    assert.throw(output, 'lineno:1 charno:0 E_INVALID_EXPRESSION: Invalid expression <user.users> passed to (each) block')
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
      const payload_1 = this.context.resolve('users')
      this.context.newFrame()
      this.context.loop(payload_1, (user, loop) => {
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
    assert.throw(output, 'lineno:1 charno:1 E_INVALID_EXPRESSION: Invalid left hand side expression <(user in index) in users> used inside an each block')
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
        const payload_1 = this.context.resolve('users')
        this.context.newFrame()
        this.context.loop(payload_1, (user, loop) => {
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

  test('parse nested loop', (assert) => {
    const statement = dedent`
    @each(users in usersGroup)
      @each(user in users)
        {{ user.username }}
      @endeach
    @else
      <p> No users found </p>
    @endeach
    `
    const template = new Template(this.tags).compileString(statement)
    this.tags.each.run(Context)

    const users = [{username: 'virk'}, {username: 'nikk'}]

    const ctx = new Context('', {
      usersGroup: _.chunk(users, 2)
    })

    const output = new TemplateRunner(template, {
      context: ctx
    }).run()

    assert.equal(output.trim(), dedent`
    virk
        nikk
    `)
  })

  test('include partial within each block', (assert) => {
    const statement = dedent`
    @!each(user in users, include = 'includes.users-loop')
    `
    const templateInstance = new Template(this.tags, {}, {}, loader)
    const template = templateInstance.compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      users: [{username: 'virk'}, {username: 'nikk'}]
    })
    templateInstance.context = ctx
    const output = new TemplateRunner(template, templateInstance).run()
    assert.equal(output.trim(), dedent`
      <p>virk</p>
      <p>nikk</p>
    `)
  })

  test('include dynamic partial within each block', (assert) => {
    const statement = dedent`
    @!each(user in users, include = usersTmp)
    `
    const templateInstance = new Template(this.tags, {}, {}, loader)
    const template = templateInstance.compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      users: [{username: 'virk'}, {username: 'nikk'}],
      usersTmp: 'includes.users-loop'
    })
    templateInstance.context = ctx
    const output = new TemplateRunner(template, templateInstance).run()
    assert.equal(output.trim(), dedent`
      <p>virk</p>
      <p>nikk</p>
    `)
  })

  test('include partial with fallback else inside each block', (assert) => {
    const statement = dedent`
    @each(user in users, include = 'includes.users-loop')
    @else
      <h2> No users found </h2>
    @endeach
    `
    const templateInstance = new Template(this.tags, {}, {}, loader)
    const template = templateInstance.compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      users: []
    })
    templateInstance.context = ctx
    const output = new TemplateRunner(template, templateInstance).run()
    assert.equal(output.trim(), dedent`
      <h2> No users found </h2>
    `)
  })

  test('loop over key value and include partial inside each loop', (assert) => {
    const statement = dedent`
    @!each((calories, name) in veggies, include = 'includes.veggie')
    `
    const templateInstance = new Template(this.tags, {}, {}, loader)
    const template = templateInstance.compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      veggies: {
        tomato: '18',
        potato: '77',
        carrot: '41'
      }
    })
    templateInstance.context = ctx
    const output = new TemplateRunner(template, templateInstance).run()
    assert.equal(output.trim(), dedent`
      <li> tomato has 18 calories </li>
      <li> potato has 77 calories </li>
      <li> carrot has 41 calories </li>
    `)
  })

  test('work with include is defined as a object', (assert) => {
    const statement = dedent`
    @!each((calories, name) in veggies, { include: 'includes.veggie' })
    `
    const templateInstance = new Template(this.tags, {}, {}, loader)
    const template = templateInstance.compileString(statement)
    this.tags.each.run(Context)

    const ctx = new Context('', {
      veggies: {
        tomato: '18',
        potato: '77',
        carrot: '41'
      }
    })
    templateInstance.context = ctx
    const output = new TemplateRunner(template, templateInstance).run()
    assert.equal(output.trim(), dedent`
      <li> tomato has 18 calories </li>
      <li> potato has 77 calories </li>
      <li> carrot has 41 calories </li>
    `)
  })

  test('throw when include expression is passed along with include statement', (assert) => {
    const statement = dedent`
    @!each(calories, name in veggies, { include: 'includes.veggie' })
    `
    const templateInstance = new Template(this.tags, {}, {}, loader)
    const template = () => templateInstance.compileString(statement)
    assert.throw(template, `lineno:1 charno:1 E_INVALID_EXPRESSION: Invalid expression <calories, name in veggies, { include: 'includes.veggie' }> passed to (each) block`)
  })
})
