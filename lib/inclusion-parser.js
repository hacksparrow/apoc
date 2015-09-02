var path = require('path')
var fs = require('fs')
var acfscript = require(__dirname + '/acfscript-parser.js')
var util = require(__dirname + '/util.js')

var debug = require('debug')('apoc:inclusion')

module.exports = function (content, cypherFilePath) {

  function parseInclusions (content, cypherFilePath) {

    var matches = content.match(/include .+\.acf/gm)

    if (matches) {
      var included = content
      matches.forEach(function (match) {
        var filePath = path.dirname(cypherFilePath) + '/' + match.split('include ')[1]
        var fileContent = fs.readFileSync(filePath).toString() + '\n'
        fileContent = util.removeComments(fileContent) // remove comments
        fileContent = parseInclusions(fileContent, filePath)
        fileContent = acfscript(fileContent) // parse local variables
        fileContent = fileContent + '\n\n' // ensure line breaks
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
