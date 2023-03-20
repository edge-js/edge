<div align="center"><img src="https://res.cloudinary.com/adonis-js/image/upload/v1620150474/edge-banner_tzmnox.jpg" width="600px"></div>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Table of contents](#table-of-contents)
- [Maintainers](#maintainers)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Edge
> A template for Node.js

[![gh-workflow-image]][gh-workflow-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url] [![synk-image]][synk-url]

Edge is a logical and batteries included template engine for Node.js. It can render any text based format, whether is **HTML**, **Markdown** or **plain text** files.

## Usage
Install the package from the npm registry.

```sh
npm i edge.js

# yarn
yarn add edge.js
```

And use it as follows

```js
const { join } = require('path')

// CommonJS
const { Edge } = require('edge.js')

// Typescript import
// import { Edge } from 'edge.js'

const edge = new Edge({ cache: false })
edge.mount(join(__dirname, 'views'))

const html = await edge.render('welcome', {
  greeting: 'Hello world'
})

console.log(html)
```

Next create the `views/welcome.edge` file.

```edge
<p> {{ greeting }} </p>
```

Edge was created to be used inside the AdonisJS framework. However it is a framework agnostic library and can be used standalone as well.

The documentation is written on the [AdonisJS website](https://docs.adonisjs.com/guides/views/rendering). In AdonisJS docs, we refer the `edge` variable as `view`.

<br />
<hr>

![](https://cdn.jsdelivr.net/gh/thetutlage/static/sponsorkit/sponsors.png)

[gh-workflow-image]: https://img.shields.io/github/actions/workflow/status/edge-js/edge/test.yml?style=for-the-badge
[gh-workflow-url]: https://github.com/edge-js/edge/actions/workflows/test.yml "Github action"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]: "typescript"

[license-image]: https://img.shields.io/npm/l/edge.js?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md 'license'

[npm-image]: https://img.shields.io/npm/v/edge.js.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/edge.js 'npm'

[synk-image]: https://img.shields.io/snyk/vulnerabilities/github/edge-js/edge?label=Synk%20Vulnerabilities&style=for-the-badge
[synk-url]: https://snyk.io/test/github/edge-js/edge?targetFile=package.json "synk"
