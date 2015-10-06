'use strict'

module.exports = function (content) {

  Object.keys(global.APOC_GLOBAL_VARS).forEach(function (key) {
    var variable = global.APOC_GLOBAL_VARS[key]
    content = content.replace(variable.match, '')
    var re = RegExp('{' + variable.name + '}', 'gm')
    content = content.replace(re, variable.value)
  })

  return content

}
