'use strict'

const nunjucks = require('nunjucks')

const statement = `
{% for user in users %}
  {{ user }}
{% endfor %}

{{ user }}
`

console.log(nunjucks.precompileString(statement, {name: 'v'}))
