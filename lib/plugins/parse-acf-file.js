'use strict'

var fs = require('fs')
var path = require('path')
var parseAll = require(__dirname + '/parse-all.js')
var debug = require('debug')('apoc:acf-file')

module.exports = function getContent (acfFilePath, vars, context) {

  if (fs.existsSync(acfFilePath)) {

    var cypherFileDir = path.dirname(acfFilePath)
    var content = fs.readFileSync(acfFilePath).toString()

    return parseAll(content, vars, context, acfFilePath)

  } else {
    throw new Error('File not found: ' + acfFilePath)
  }

}
