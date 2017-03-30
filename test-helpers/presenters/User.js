'use strict'

class UserPresenter {
  constructor (data) {
    this.$data = data
  }

  get username () {
    return this.$data.username.toUpperCase()
  }
}

module.exports = UserPresenter
