var safeEval = require('safe-eval')
var debug = require('debug')('apoc:jscode')

module.exports = function jscode (content, context) {

  var matches = content.match(/`[^`]+`/g)

  if (matches) {
    matches.forEach(function (match) {
      var code = match.replace(/`/g, '')
      var e = safeEval(code, context)
      content = content.replace(match, e)
    })
  }

  debug(content)

  return content

}
