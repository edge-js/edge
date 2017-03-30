'use strict'

const nunjucks = require('nunjucks')
const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()
const edge = new (require('../src/Edge'))()

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
  return edge.compileString(edgeStatement)
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

suite.add('Edge', function () {
  compileEdge()
})
.add('Nunjucks', function () {
  compileNunjucks()
})
.on('cycle', function (event) {
  console.log(String(event.target))
})
.on('complete', function () {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run()
