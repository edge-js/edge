# Edge
> Templating with some fresh air

Edge is a logical templating engine for Node.js. The syntax language is naturally similar to Javascript, making it simpler to write and remember.

<br />


[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]
[![Appveyor][appveyor-image]][appveyor-url]

<br />

---

<br />

## Features

1. Beautiful Syntax
2. Encourages component based layout
3. Runtime debugging via chrome devtools.
4. Helpful error messages
5. Support for Layouts
6. Extraction markup via Partials.

The official documentation will soon be published on http://edge.adonisjs.com

### Usage

```js
const edge = require('edge.js')

// configure cache
edge.configure({
  cache: process.env.NODE_EV === 'production'
})

// register views
edge.registerViews(path.join(__dirname, 'views'))

// render view
edge.render('welcome')
```

## Running Tests

```bash
# just the tests
npm run test:local

# tests + report coverage on coveralls
npm run test

# run tests on windows
npm run test:win

# tests with local coverage report
npm run coverage
```

## Running Benchmarks

Make sure to install `nunjucks` before running benchmarks in comparison to nunjucks.

```
node benchmarks/loop.js
node benchmarks/conditionals.js
```

[appveyor-image]: https://ci.appveyor.com/api/projects/status/github/poppinss/edge?branch=master&svg=true&passingText=Passing%20On%20Windows
[appveyor-url]: https://ci.appveyor.com/project/thetutlage/edge

[npm-image]: https://img.shields.io/npm/v/edge.js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/edge.js

[travis-image]: https://img.shields.io/travis/poppinss/edge/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/poppinss/edge

[npm-downloads]: https://img.shields.io/npm/dm/edge.js.svg?style=flat-square
