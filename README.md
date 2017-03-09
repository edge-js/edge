# Edge

## Exception Handling

In order to make sure that edge serves it purpose, we need solid exception handling inside the entire code base.

## First Level Benchmarks

### Simple Conditionals (compile only)
```
Edge x 68,128 ops/sec ±2.66% (86 runs sampled)
Nunjucks x 5,766 ops/sec ±3.19% (83 runs sampled)
Fastest is Edge
```

### Each Loop (compile only)
```
Edge x 72,273 ops/sec ±0.79% (91 runs sampled)
Nunjucks x 5,823 ops/sec ±2.69% (83 runs sampled)
Fastest is Edge
```


### Lexer Exceptions

Lexer exceptions should be broad and does not contain any domain logic, since Lexer has no idea about the template context and basically is a simple Javascript expression parser.

1. Make sure to pass `indexno` whenever possible.
2. Make sure to mention `Report package author.` When something unexpected happens.

### Template Compiler

Template compiler should throw domain specific exceptions. It should have `lineno:`, `indexno:` with each exception.

Also it should format exceptions by mentioning the tag on which it happend and the **untouched statement** which was responsible for it.

Also tags can catch exceptions by themselves, but if they don't the template compiler is responsible for generating best possible exceptions

### Template Runner

At this point we should be 90% cover, since Javascript keeps lot of runtime context, there are chances that templates may break in runtime.

> NEED MORE THINKING HERE.


### Usage

```
const edge = require('edge')

edge.compiledDir('out') // optional
edge.registerViews(path.join(__dirname, 'views')) // mount views
edge.registerPresenters(path.join(__dirname, 'views')) // mount presenters

edge.render('somepath') // mounting required
edge.renderString() // a plain string

edge.compile() // compile a file - mounting required
edge.compileString() // compile a string to a function

edge.tag() // register a tag
edge.global() // register a global
edge.presenter().render() // render with presenter

edge.doNotCompile() // do not compile in runtime

```
