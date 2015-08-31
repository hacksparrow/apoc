var path = require('path')
var fs = require('fs')
var debug = require('debug')('apoc:inclusion')

module.exports = function(content, cypherFilePath) {

  function parseInclusions(content, cypherFilePath) {

    var matches = content.match(/include .+\.acf/gm)

    if (matches) {
      var included = content
      matches.forEach(function (match) {
        var filePath = path.dirname(cypherFilePath) + '/' + match.split('include ')[1]
        var fileContent = fs.readFileSync(filePath).toString() + '\n'
        fileContent = parseInclusions(fileContent, filePath)
        included = included.replace(match, fileContent)
      })
      return included
    } else {
      return content
    }

  }

  var parsed = parseInclusions(content, cypherFilePath)
  parsed = parsed.replace(/(\n){2,}/mg, '\n\n') // removed extra linebreaks

  debug(parsed)

  return parsed
}
