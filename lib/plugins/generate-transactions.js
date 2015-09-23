'use strict'

var debug = require('debug')('apoc:transactions')
var assert = require('assert')
var readAcfFile = require(__dirname + '/read-acf-file.js')
var parseJs = require(__dirname + '/parse-js.js')
var parseInclusions = require(__dirname + '/parse-inclusions.js')
var parseAcfScript = require(__dirname + '/parse-acfscript.js')
var parseTemplate = require(__dirname + '/parse-template.js')
var parseGlobals = require(__dirname + '/parse-globals.js')

module.exports = function (input, vars, context) {

  assert(input, 'Specify a file path or a Cypher / ACF query')

  var queryType = 'string'
  if (input.match(/\.acf$/)) {
    queryType = 'file'
    input = readAcfFile(input) // ACFscript
  }

  var transactions = generateTransactions(input, queryType)

  console.log(input)
  console.log('-------------------------------------')
  console.log(transactions)
  process.exit()

  debug('Transactions:', JSON.stringify(transactions))

}


function generateTransactions(content, queryType) {

  var transactions = []
  content = content.trim()

  if (queryType === 'file') {
    var cypherFileDir = path.dirname(content)
    content = fs.readFileSync(cypherFileDir).toString()
  }

  // convert semicolons to statements
  content = content.replace(/;$/gm, '\n\n')

  // convert dashes to transactions
  var transactionIndex = 0
  content.split(/^\-+/gm).forEach(function (transaction) {

    transaction = transaction.trim()

    if (transaction) {

      transaction[transactionIndex] = []
      transaction.split('\n\n').forEach(function (statement) {

        statement = statement.trim()

        // don't process empty lines
        if (statement.length > 0) {

          // include files
          var includes = statement.match(/include \w+.acf/g)

          if (includes) {
            includes.forEach(function (include) {
              var file = cypherFileDir + '/' + include.split(' ')[1]
              statement = statement.replace(include, fs.readFileSync(file))
            })
          }
          transaction[transactionIndex].push(statement)
        }

      })
    }

  })

  return transactions

}


