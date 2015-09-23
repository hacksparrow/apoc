'use strict'

var debug = require('debug')('apoc:transactions')
var path = require('path')
var fs = require('fs')
var assert = require('assert')
var parseAcfFile = require(__dirname + '/parse-acf-file.js')
var parseAll = require(__dirname + '/parse-all.js')

module.exports = function (content, vars, context) {

  assert(content, 'Specify a file path or a Cypher / ACF query')

  var queryType = 'string'
  // render acf file
  if (content.match(/\.acf$/)) {
    queryType = 'file'
    content = parseAcfFile(content, vars, context)
  }
  // process acf query
  else {
    content = parseAll(content, vars, context)
  }

  // content is now a string of query statement(s)
  // generate the transaction array(s)
  return generateTransactions(content)

}

function generateTransactions(content, vars, context) {

  var transactions = []

  // all file and content processing should has been done by now
  // this stage is only for transaction data structure generation
  content = content.trim()

  // convert semicolons to statements
  content = content.replace(/;$/gm, '\n\n')
  // remove excess newlines
  content = content.replace(/\n{3}/gm, '\n\n')

  // convert dashes to transactions
  var transactionIndex = 0
  content.split(/^\-+/gm).forEach(function (transaction) {

    transaction = transaction.trim()

    if (transaction) {

      transactions[transactionIndex] = []
      transaction.split('\n\n').forEach(function (statement) {

        statement = statement.trim()

        // don't process empty lines
        if (statement) {

          // include files
          var includes = statement.match(/include \w+.acf/g)

          if (includes) {
            includes.forEach(function (include) {
              var file = cypherFileDir + '/' + include.split(' ')[1]
              statement = statement.replace(include, fs.readFileSync(file))
            })
          }
          transactions[transactionIndex].push(statement)
        }

      })

      transactionIndex++
    }

  })

  return transactions

}


