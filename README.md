# Edge

## First Level Benchmarks

### Simple Conditionals (compile only)
```
Edge x 44,159 ops/sec ±1.02% (86 runs sampled)
Nunjucks x 5,227 ops/sec ±2.51% (80 runs sampled)
Fastest is Edge
```

### Each Loop (compile only)
```
Edge x 35,930 ops/sec ±2.07% (81 runs sampled)
Nunjucks x 5,161 ops/sec ±2.12% (80 runs sampled)
Fastest is Edge
```

### Usage

```
const edge = require('edge')

edge.registerViews(path.join(__dirname, 'views')) // mount views
edge.registerPresenters(path.join(__dirname, 'views')) // mount presenters

edge.render('welcome')

edge.tag() // register a tag
edge.global() // register a global
edge.presenter().render() // render with presenter
edge.share().render() // share locals and render
```
