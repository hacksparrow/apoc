var debug = require('debug')('apoc:template')

module.exports = function template (content, vars) {

  var matches = content.match(/%[^%]+%/g)

  if (matches) {
    matches.forEach(function (match) {
      var key = match.replace(/%/g, '')
      content = content.replace(match, vars[key])
    })
  }

  debug(content)

  return content
}
