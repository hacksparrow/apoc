'use strict'

let crypto = require('crypto')

module.exports = {

  acfPath: function acfPath(name) {
    return __dirname + '/fixtures/' + name
  },

  md5: function md5(input) {
    return crypto.createHash('md5').update(input).digest('hex')
  }

}
