'use strict'

let safeEval = require('safe-eval')
let debug = require('debug')('apoc:jscode')

module.exports = function jscode (content, context) {

  let matches = content.match(/`[^`]+`/g)

  if (matches) {
    matches.forEach(function (match) {
      let code = match.replace(/`/g, '')
      let e = safeEval(code, context)
      content = content.replace(match, e)
    })
  }

  debug(content)

  return content

}
