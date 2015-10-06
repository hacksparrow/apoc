#! /usr/bin/env node

/* globals global */

'use strict'

global.APOC_GLOBAL_VARS = {}

var path = require('path')
var pkg = require(__dirname + '/package.json')
var program = require('commander')
var commandlineApoc = require(__dirname + '/lib/commandline-query.js')

program
.version(pkg.version)
.option('-v, --verbose', 'Verbose response messages')
.option('-q, --query', 'Print query statements')
.parse(process.argv)

// commandline tool
if (require.main === module) {
  if (process.argv.length < 3) {
    program.help()
  } else {
    var cypherFilePath = process.argv[2]
    var ext = path.extname(cypherFilePath)

    // having an extension helps to ensure we are using the right file
    if (ext === '.acf') {
      var config = require(__dirname + '/lib/config-reader.js')
      var query = commandlineApoc(cypherFilePath)
      query.exec(config).then(function (res) {
        var counted = res.length > 1 ? 'statements' : 'statement'
        if (program.query) logQuery(query)
        if (program.verbose) {
          console.log('')
          console.log(JSON.stringify(res))
          console.log('')
        }
        console.log('Query executed successfully with %d %s', res.length, counted)
      }, function (fail) {
        if (program.query) logQuery(query)
        if (program.verbose) console.log(fail)
        else console.log(fail.message)
      }, function (transaction) {
        console.log(transaction)
        console.log('---------')
      })
    } else {
      console.log('File type "%s" not supported', ext)
    }
  }
} else {
  module.exports = require(__dirname + '/lib/apoc-module.js')
}

function logQuery (query) {
  console.log()
  console.log(query.statements)
  console.log()
}
