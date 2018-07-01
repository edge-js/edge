require('ts-node/register')

const cli = require('japa/cli')
cli.run('test/**/*.spec.ts')
