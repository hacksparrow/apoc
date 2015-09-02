#! /usr/bin/env node

var path = require('path')
var pkg = require(__dirname + '/package.json')
var program = require('commander')
var apoc = require(__dirname + '/lib/commands/query.js')

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
      var query = apoc(cypherFilePath)
      query.exec(config).then(function (res) {
        var counted = res.length > 1 ? 'statements' : 'statement'
        console.log('Query executed successfully with %d %s', res.length, counted)
        if (program.query) logQuery(query)
        if (program.verbose) {
          console.log('')
          console.log(JSON.stringify(res))
          console.log('')
        }
      }, function (fail) {
        if (program.query) logQuery(query)
        if (program.verbose) console.log(fail)
        else console.log(fail.message)
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
