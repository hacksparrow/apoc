'use strict'

var fs = require('fs')
var path = require('path')
var stripComments = require(__dirname + '/strip-comments.js')
var parseNeo4jShellScript = require(__dirname + '/parse-neo4j-shell-script.js')
var parseInclusions = require(__dirname + '/parse-inclusions.js')
var parseAcfScript = require(__dirname + '/parse-acf-script.js')
var parseTemplate = require(__dirname + '/parse-template.js')
var parseJs = require(__dirname + '/parse-js.js')
var parseGlobals = require(__dirname + '/parse-globals.js')
var debug = require('debug')('apoc:acf-file')

module.exports = function parseAll(content, vars, context, acfFilePath) {

  content = content.trim()

  if (content) {

    content = stripComments(content)
    content = parseNeo4jShellScript(content)
    if (acfFilePath) {
      content = parseInclusions(content, acfFilePath) // include files
    }
    content = parseAcfScript(content) // top level acfscript

    if (vars) content = parseTemplate(content, vars) // template
    content = parseJs(content, context) // js code

    content = parseGlobals(content)

    return content

  }

}
