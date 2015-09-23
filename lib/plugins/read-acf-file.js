'use strict'

var fs = require('fs')
var path = require('path')
var parseInclusions = require(__dirname + '/parse-inclusions.js')
var parseAcfScript = require(__dirname + '/parse-acfscript.js')
var parseTemplate = require(__dirname + '/parse-template.js')
var parseJs = require(__dirname + '/parse-js.js')
var parseGlobals = require(__dirname + '/parse-globals.js')
var debug = require('debug')('apoc:acf')

module.exports = function getContent (acfFilePath, vars, context) {

  if (fs.existsSync(acfFilePath)) {

    var cypherFileDir = path.dirname(acfFilePath)
    var content = fs.readFileSync(acfFilePath).toString()

    content = parseInclusions(content, acfFilePath) // include files
    content = parseAcfScript(content) // top level acfscript

    if (vars) content = parseTemplate(content, vars) // template
    content = parseJs(content, context) // js code

    content = parseGlobals(content)

    return content

  } else {
    throw new Error('File not found: ' + acfFilePath)
  }

}
