'use strict'

const nunjucks = require('nunjucks')
const suite = new(require('benchmark')).Suite
const Template = require('../src/Template/compiler')
const ifTag = require('../src/Tags/').ifTag
const elseIfTag = require('../src/Tags/').elseIfTag
const elseTag = require('../src/Tags/').elseTag
const eachTag = require('../src/Tags/').eachTag

const tags = {
  if: {
    name: 'if',
    isBlock: true,
    compile: ifTag.compile.bind(ifTag)
  },
  elseif: {
    name: 'elseif',
    isBlock: false,
    compile: elseIfTag.compile.bind(elseIfTag)
  },
  else: {
    name: 'else',
    isBlock: false,
    compile: elseTag.compile.bind(elseTag)
  },
  each: {
    name: 'each',
    isBlock: true,
    compile: eachTag.compile.bind(eachTag)
  }
}

const edgeStatement = `
@each(user in users)
  {{ user.username }}
@endeach
`

const nunjucksStatement = `
{% for user in users %}
  {{ user.username }}
{% endfor %}
`

function compileEdge () {
  const template = new Template(tags, edgeStatement)
  return template.compile()
}

const env = new nunjucks.Environment({
  noCache: false
})

function compileNunjucks () {
  return nunjucks.precompileString(nunjucksStatement, {
    name: 'foo',
    env: env
  })
}

suite.add('Edge', function() {
  compileEdge()
})
.add('Nunjucks', function() {
  compileNunjucks()
})
.on('cycle', function(event) {
  console.log(String(event.target))
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run()
