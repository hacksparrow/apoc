var path = require('path')
var fs = require('fs')

var readAcfFile = require(__dirname + '/read-acf-file.js')
var parseJs = require(__dirname + '/parse-js.js')
var parseInclusions = require(__dirname + '/parse-inclusions.js')
var parseAcfScript = require(__dirname + '/parse-acfscript.js')
var parseTemplate = require(__dirname + '/parse-template.js')
var parseGlobals = require(__dirname + '/parse-globals.js')

var debug = require('debug')('apoc:inclusion')

module.exports = function (content, cypherFilePath) {

  function parseInclusions (content, cypherFilePath) {

    var matches = content.match(/include .+\.acf/gm)

    if (matches) {
      var included = content
      matches.forEach(function (match) {
        var filePath = path.dirname(cypherFilePath) + '/' + match.split('include ')[1]
        var fileContent = fs.readFileSync(filePath).toString() + '\n'
        fileContent = stripComments(fileContent) // remove comments
        fileContent = parseInclusions(fileContent, filePath)
        fileContent = parseAcfScript(fileContent) // parse local variables
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
