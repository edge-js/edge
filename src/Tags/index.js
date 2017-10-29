'use strict'

/*
 * edge
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = {
  ifTag: new (require('./IfTag'))(),
  elseIfTag: new (require('./ElseIfTag'))(),
  elseTag: new (require('./ElseTag'))(),
  eachTag: new (require('./EachTag'))(),
  includeTag: new (require('./IncludeTag'))(),
  componentTag: new (require('./ComponentTag'))(),
  slotTag: new (require('./SlotTag'))(),
  sectionTag: new (require('./SectionTag'))(),
  yieldTag: new (require('./YieldTag'))(),
  debugger: new (require('./DebuggerTag'))(),
  raw: new (require('./RawTag'))(),
  unless: new (require('./UnlessTag'))(),
  mustache: new (require('./MustacheTag'))(),
  set: new (require('./SetTag'))()
}
