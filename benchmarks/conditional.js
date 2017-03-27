'use strict'

const nunjucks = require('nunjucks')
const Benchmark = require('benchmark')
const suite = new Benchmark().Suite
const edge = new (require('../src/Edge'))()

const edgeStatement = `
@if(username === 'virk')
  <p> Hello {{ username }} </p>
@else
  <p> Hello anonymous </p>
@endif
`

const nunjucksStatement = `
{% if username === 'virk' %}
  <p> Hello {{ username }} </p>
{% else %}
  <p> Hello anonymous </p>
{% endif %}
`

function compileEdge () {
  return edge.compileString(edgeStatement)
}

nunjucks.configure('', {
  noCache: true
})

function compileNunjucks () {
  return nunjucks.precompileString(nunjucksStatement, {
    name: 'foo'
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
