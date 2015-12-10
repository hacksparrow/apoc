'use strict'

let fs = require('fs')
let path = require('path')
let parseAll = require(__dirname + '/parse-all.js')
let debug = require('debug')('apoc:acf-file')

module.exports = function getContent (acfFilePath, lets, context) {

  if (fs.existsSync(acfFilePath)) {

    let cypherFileDir = path.dirname(acfFilePath)
    let content = fs.readFileSync(acfFilePath).toString()

    return parseAll(content, lets, context, acfFilePath)

  } else {
    throw new Error('File not found: ' + acfFilePath)
  }

}
