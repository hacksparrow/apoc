'use strict'

let path = require('path')
let fs = require('fs')

let stripComments = require(__dirname + '/strip-comments.js')
let parseNeo4jShellScript = require(__dirname + '/parse-neo4j-shell-script.js')
let parseAcfFile = require(__dirname + '/parse-acf-file.js')
let parseJs = require(__dirname + '/parse-js.js')
let parseInclusions = require(__dirname + '/parse-inclusions.js')
let parseAcfScript = require(__dirname + '/parse-acf-script.js')
let parseTemplate = require(__dirname + '/parse-template.js')
let parseGlobals = require(__dirname + '/parse-globals.js')

let debug = require('debug')('apoc:inclusion')

module.exports = function (content, cypherFilePath) {

  function parseInclusions (content, cypherFilePath) {

    let matches = content.match(/include .+\.acf/gm)

    if (matches) {

      let included = content
      matches.forEach(function (match) {
        let filePath = path.dirname(cypherFilePath) + '/' + match.split('include ')[1]
        let fileContent = fs.readFileSync(filePath).toString() + '\n'
        fileContent = stripComments(fileContent) // remove comments
        fileContent = parseNeo4jShellScript(fileContent)
        fileContent = parseDefaultInclusions(fileContent)
        fileContent = parseInclusions(fileContent, filePath)
        fileContent = parseAcfScript(fileContent) // parse local letiables
        fileContent = fileContent + '\n\n' // ensure line breaks
        included = included.replace(match, fileContent)
      })
      return included

    } else {
      return content
    }

  }

  let parsed = parseInclusions(content, cypherFilePath)
  parsed = parsed.replace(/(\n){2,}/mg, '\n\n') // removed extra linebreaks

  debug(parsed)

  return parsed
}


function parseDefaultInclusions(content) {

  var _content = ''
  content.split('\n').forEach(function (line) {
    if (line.startsWith('include') && !(line.endsWith('.acf'))) {
      line = line + '/index.acf'
    }
    _content += line + '\n'
  })

  return _content

}
