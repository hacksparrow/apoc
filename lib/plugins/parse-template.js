'use strict'

let debug = require('debug')('apoc:template')

module.exports = function template (content, lets) {

  let matches = content.match(/\{\w+\}/gm)

  if (matches) {
    matches.forEach(function (match) {
      let key = match.replace(/\{/gm, '').replace(/\}/gm, '')
      content = content.replace(match, lets[key])
    })
  }

  debug(content)

  return content
}
