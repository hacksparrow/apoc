/* globals global */

var jscode = require(__dirname + '/jscode.js')

module.exports = function (content) {

  var parsed = content

  var locals = content.match(/var \w+.+\n/gm)

  if (locals) {
    locals.forEach(function (match) {
      var temp = match.split('=')
      var varName = temp[0].split(' ')[1].trim()
      var value = match.replace('=', '').replace('var ' + varName, '').trim()
      var varValue = jscode(value)

      parsed = parsed.replace(match, '')
      var re = RegExp('%' + varName + '%', 'gm')
      parsed = parsed.replace(re, varValue)

    })
  }

  var globals = content.match(/global \w+.+\n/gm)
  if (globals) {
    globals.forEach(function (match) {
      // don't interpolate at this state, just make a list of global vars
      var temp = match.split('=')
      var varName = temp[0].split(' ')[1].trim()
      var value = match.replace('=', '').replace('global ' + varName, '').trim()
      var varValue = jscode(value)

      global.APOC_GLOBAL_VARS[varName] = {
        match: match,
        name: varName,
        value: varValue
      }

    })
  }

  return parsed
}
