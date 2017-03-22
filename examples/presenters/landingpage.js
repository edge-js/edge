'use strict'

const _ = require('lodash')
const BasePresenter = require('../../index').BasePresenter

class LandingPagePresenter extends BasePresenter {
  groupRows (rows) {
    return _.chunk(rows, 3)
  }

  get marketingRows () {
    return _.map(_.range(6), () => {
      return {
        heading: 'Sub-heading',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Minus iure perferendis natus, reprehenderit rerum voluptatum nobis ratione aliquam nihil repudiandae consectetur porro ex, commodi quod tenetur sequi explicabo facere quae.'
      }
    })
  }

  index (parentIndex, i) {
    return (parentIndex * 3) + (i + 1)
  }
}

module.exports = LandingPagePresenter
