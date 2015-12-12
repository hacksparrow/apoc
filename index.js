#! /usr/bin/env node

/* globals global */

'use strict'

global.APOC_GLOBAL_VARS = {}

let path = require('path')
let pkg = require(__dirname + '/package.json')
let program = require('commander')
let c = require('chalk')
let Apoc = require(__dirname + '/lib/apoc-class.js')

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

      var apocCmd = new Apoc()
      apocCmd.query(cypherFilePath)

      let statementsCount = 0
      let transactions = apocCmd.transactions
      transactions.forEach(function (transaction) {
        statementsCount += transaction.statements.length
      })

      let statementsCounted = statementsCount > 1 ? 'statements' : 'statement'

      let transactionCount = transactions.length
      let transactionCounted = transactionCount > 1 ? 'transactions' : 'transaction'

      apocCmd.exec().then(function (result) {

        if (program.verbose) {
          console.log(c.bold('\n%s >'), transactionCounted.toUpperCase())
          logQuery(apocCmd.transactions)
          console.log(c.bold('RESULT >\n'))
          console.log(JSON.stringify(result))
        }

        console.log('\nQuery executed successfully with %d %s in %d %s \n',
          statementsCount, statementsCounted,
          transactionCount, transactionCounted)

      }, function (fail) {
        if (program.verbose) {
          console.log(c.bold('\n%s >'), transactionCounted.toUpperCase())
          logQuery(apocCmd.transactions)
          console.log(c.bold.red('FAIL >\n'))
          console.log(fail)
        }
        console.log()
        console.log(fail.message)
        console.log()
      })
    } else {
      console.log('\n File type "%s" not supported\n', ext)
    }
  }
} else {
  module.exports = Apoc
}

function logQuery(query) {
  console.log()
  console.log(query)
  console.log()
}
