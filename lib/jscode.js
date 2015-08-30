var safeEval = require('safe-eval')

module.exports = function jscode(content) {

  var matches = content.match(/`[^`]+`/g)

  if (matches) {
    matches.forEach(function (match) {
      var code = match.replace(/`/g, '')
      var e = safeEval(code)
      content = content.replace(match, e)
    })
  }

  return content

}
