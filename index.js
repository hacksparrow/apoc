#! /usr/bin/env node

/* globals global */

'use strict'

global.APOC_GLOBAL_VARS = {}

let path = require('path')
let pkg = require(__dirname + '/package.json')
let program = require('commander')
let commandlineApoc = require(__dirname + '/lib/commandline-query.js')

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
    let cypherFilePath = process.argv[2]
    let ext = path.extname(cypherFilePath)

    // having an extension helps to ensure we are using the right file
    if (ext === '.acf') {

      let config = require(__dirname + '/lib/config-reader.js')
      let query = commandlineApoc(cypherFilePath)

      query.exec(config).then(function (transactions) {

        let statementsCount = 0
        transactions.forEach(function (transaction) {
          statementsCount += transaction.length
        })

        let statementsCounted = statementsCount > 1 ? 'statements' : 'statement'

        let transactionCount = transactions.length
        let transactionCounted = transactionCount > 1 ? 'transactions' : 'transaction'

        if (program.verbose) {
          console.log('%s >', transactionCounted.toUpperCase())
          logQuery(query)
          console.log('RESULT >\n')
          console.log(JSON.stringify(transactions))
          console.log('')
        }

        console.log('Query executed successfully with %d %s in %d %s',
          statementsCount, statementsCounted,
          transactionCount, transactionCounted)

      }, function (fail) {
        if (program.verbose) {
          logQuery(query)
          console.log(fail)
        }
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
  console.log(query.transactions)
  console.log()
}
