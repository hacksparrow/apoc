/* global md5, bcrypt */

var crypto = require('crypto')

md5 = function (input) {
  return crypto.createHash('md5').update(input).digest('hex')
}

bcrypt = require('bcrypt')
