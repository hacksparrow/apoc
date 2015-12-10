'use strict'

module.exports = function (content) {

  Object.keys(global.APOC_GLOBAL_VARS).forEach(function (key) {
    let letiable = global.APOC_GLOBAL_VARS[key]
    content = content.replace(letiable.match, '')
    let re = RegExp('{' + letiable.name + '}', 'gm')
    content = content.replace(re, letiable.value)
  })

  return content

}
