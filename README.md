# Edge

## Exception Handling

In order to make sure that edge serves it purpose, we need solid exception handling inside the entire code base.

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

edge.compiledDir('out')
edge.mountDefault(path.join(__dirname, 'views'))
edge.mount('abc', path.join(__dirname, 'abc'))

edge.render('somepath')
edge.renderString()
edge.compileString()

edge.compile()

edge.tag()
edge.global()
```


