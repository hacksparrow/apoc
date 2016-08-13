'use strict'

let fs = require('fs')
let path = require('path')
let parseAll = require(__dirname + '/parse-all.js')
let debug = require('debug')('apoc:acf-file')

module.exports = function parseAcfFile (acfFilePath, lets, context) {

  if (fs.existsSync(acfFilePath)) {

    let content = fs.readFileSync(acfFilePath).toString()

    // default to index.acf, if a directory is specified
    var formattedStatement = ''
    content.split('\n').forEach(function (line) {
      if (line.startsWith('include') && !(line.endsWith('.acf'))) {
        line = line + '/index.acf'
      }
      formattedStatement += line + '\n'
    })

    content = formattedStatement

    return parseAll(content, lets, context, acfFilePath)

  } else {
    throw new Error('File not found: ' + acfFilePath)
  }

}
