// @ts-check

const edge = require('..')
const { join } = require('path')

edge.mount(join(__dirname, './views'))
console.log(edge.render('user', { title: 'Hello' }))
