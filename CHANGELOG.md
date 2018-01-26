<a name="1.1.4"></a>
## [1.1.4](https://github.com/poppinss/edge/compare/v1.1.3...v1.1.4) (2018-01-26)


### Bug Fixes

* **memberexpression:** parse nested memberexpression ([5aee3ba](https://github.com/poppinss/edge/commit/5aee3ba)), closes [#21](https://github.com/poppinss/edge/issues/21)



<a name="1.1.3"></a>
## [1.1.3](https://github.com/poppinss/edge/compare/v1.1.2...v1.1.3) (2017-11-27)


### Bug Fixes

* **include:** allow callExpression inside include ([cbbe629](https://github.com/poppinss/edge/commit/cbbe629))
* **ReDoS:** Regular Expression Denial of Service (#7) ([39777cc](https://github.com/poppinss/edge/commit/39777cc))


### Features

* **edge:** add edge.new method to newup isolated template ([5db5710](https://github.com/poppinss/edge/commit/5db5710))
* **globals:** add orderBy method ([6ad7190](https://github.com/poppinss/edge/commit/6ad7190))


<a name="1.1.2"></a>
## [1.1.2](https://github.com/poppinss/edge/compare/v1.1.1...v1.1.2) (2017-10-29)


### Bug Fixes

* **ast:** trim whitespace in tag end ([2ff8b36](https://github.com/poppinss/edge/commit/2ff8b36)), closes [#3](https://github.com/poppinss/edge/issues/3)
* **component:** access globals and optionally share data ([5bc9889](https://github.com/poppinss/edge/commit/5bc9889)), closes [#2](https://github.com/poppinss/edge/issues/2)


### Features

* **tags:** add set tag ([a6735fc](https://github.com/poppinss/edge/commit/a6735fc))


### Reverts

* **component:** remove option to share data with component ([83c57e5](https://github.com/poppinss/edge/commit/83c57e5))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/poppinss/edge/compare/v1.1.0...v1.1.1) (2017-10-08)


### Features

* **tags:** add mustache tag ([d46022e](https://github.com/poppinss/edge/commit/d46022e))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/poppinss/edge/compare/v1.0.2...v1.1.0) (2017-09-23)


### Features

* **tags:** allow multiline tags ([e7783f5](https://github.com/poppinss/edge/commit/e7783f5))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/poppinss/edge/compare/v1.0.1...v1.0.2) (2017-08-08)


### Bug Fixes

* **context:** bind context to global functions ([e0a2685](https://github.com/poppinss/edge/commit/e0a2685))


### Features

* **globals:** add elIf ([fb522ce](https://github.com/poppinss/edge/commit/fb522ce))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/poppinss/edge/compare/v1.0.0...v1.0.1) (2017-06-21)


### Features

* **globals:** add globals ([7ddbb1e](https://github.com/poppinss/edge/commit/7ddbb1e))
* **tags:** export BaseTag to be extended by custom tags ([cfdfd04](https://github.com/poppinss/edge/commit/cfdfd04))
* **template:** edge.share now merges locals ([7402af4](https://github.com/poppinss/edge/commit/7402af4))



<a name="1.0.0"></a>
# 1.0.0 (2017-03-30)


### Bug Fixes

* **tags:** allow nested each loops ([47ebd9c](https://github.com/poppinss/edge/commit/47ebd9c))


### Features

* **ast:** add support for inline & block comments ([cb06a6b](https://github.com/poppinss/edge/commit/cb06a6b))
* **ast:** add support for self closing tags ([016bf48](https://github.com/poppinss/edge/commit/016bf48))
* **cache:** support for in-memory cache ([7e7b61b](https://github.com/poppinss/edge/commit/7e7b61b))
* **component:** add support for define presenter ([7a90885](https://github.com/poppinss/edge/commit/7a90885))
* **context:** add safe method to ignore escaping ([dfb7d46](https://github.com/poppinss/edge/commit/dfb7d46))
* **each:** add support for inlcude inside each ([c876c2d](https://github.com/poppinss/edge/commit/c876c2d))
* **each-tag:** add `isEven` and `isOdd` to ([9be4fbe](https://github.com/poppinss/edge/commit/9be4fbe))
* **edge:** add support for cache ([3e46c85](https://github.com/poppinss/edge/commit/3e46c85))
* **expression:** add support for conditional expression ([6b6d1d2](https://github.com/poppinss/edge/commit/6b6d1d2))
* **globals:** add couple of globals ([f1bf6e0](https://github.com/poppinss/edge/commit/f1bf6e0))
* **if:** add support for unary expression ([15ea142](https://github.com/poppinss/edge/commit/15ea142))
* **layout:** add support for [@super](https://github.com/super) keyword ([8f79a9b](https://github.com/poppinss/edge/commit/8f79a9b))
* **layout:** implement layouts ([56ed7c9](https://github.com/poppinss/edge/commit/56ed7c9))
* **tag:** add debugger tag ([65ac9cd](https://github.com/poppinss/edge/commit/65ac9cd))
* **tag:** add raw tag ([9498e63](https://github.com/poppinss/edge/commit/9498e63))
* **tag:** add unless tag ([5c86bb0](https://github.com/poppinss/edge/commit/5c86bb0))
* **tags:** implement yield tag ([e1445d8](https://github.com/poppinss/edge/commit/e1445d8))



