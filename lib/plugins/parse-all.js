'use strict'

let fs = require('fs')
let path = require('path')
let stripComments = require(__dirname + '/strip-comments.js')
let parseNeo4jShellScript = require(__dirname + '/parse-neo4j-shell-script.js')
let parseInclusions = require(__dirname + '/parse-inclusions.js')
let parseAcfScript = require(__dirname + '/parse-acf-script.js')
let parseTemplate = require(__dirname + '/parse-template.js')
let parseJs = require(__dirname + '/parse-js.js')
let parseGlobals = require(__dirname + '/parse-globals.js')
let debug = require('debug')('apoc:acf-file')

module.exports = function parseAll(content, variables, context, acfFilePath) {

  content = content.trim()

  if (content) {

    content = stripComments(content)
    content = parseNeo4jShellScript(content)
    if (acfFilePath) {
      content = parseInclusions(content, acfFilePath) // include files
    }
    content = parseAcfScript(content) // top level acfscript

    if (variables) content = parseTemplate(content, variables) // template
    content = parseJs(content, context) // js code

    content = parseGlobals(content)

    return content

  }

}
