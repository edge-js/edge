'use strict'

const nunjucks = require('nunjucks')
const path = require('path')
const viewsDir = path.join(__dirname, './')
nunjucks.configure(viewsDir)

console.log(nunjucks.precompile(path.join(viewsDir, './simple.njk')))
