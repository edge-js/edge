'use strict'

const cli = require('japa/cli')
cli.run('test/**/*.spec.js')
cli.filter('test/**/*.async.spec.js')
