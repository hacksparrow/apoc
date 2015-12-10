/* globals global */
'use strict'

// we need this, since an acf var may be a JS expression
let parseJs = require(__dirname + '/parse-js.js')

module.exports = function (content) {

  let parsed = content

  let locals = content.match(/var \w+.+\n/gm)

  if (locals) {
    locals.forEach(function (match) {
      let temp = match.split('=')
      let varName = temp[0].split(' ')[1].trim()
      let value = match.replace('=', '').replace('var ' + varName, '').trim()
      let varValue = parseJs(value)

      parsed = parsed.replace(match, '')
      let re = RegExp('{' + varName + '}', 'gm')
      parsed = parsed.replace(re, varValue)

    })
  }

  let globals = content.match(/global \w+.+\n/gm)
  if (globals) {
    globals.forEach(function (match) {
      // don't interpolate at this state, just make a list of global vars
      let temp = match.split('=')
      let varName = temp[0].split(' ')[1].trim()
      let value = match.replace('=', '').replace('global ' + varName, '').trim()
      let varValue = parseJs(value)

      global.APOC_GLOBAL_VARS[varName] = {
        match: match,
        name: varName,
        value: varValue
      }

    })
  }

  return parsed
}
