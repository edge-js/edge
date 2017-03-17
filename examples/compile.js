'use strict'

const fs = require('fs')
const path = require('path')
const edge = require('../index')
edge.registerViews(path.join(__dirname, './'))

fs.writeFileSync(path.join(__dirname, 'loop.compiled.js'), edge.compile('loop.edge'))
