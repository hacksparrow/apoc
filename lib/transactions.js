'use strict'

let debug = require('debug')('apoc:transactions')
let path = require('path')
let fs = require('fs')
let assert = require('assert')
let parseAcfFile = require(__dirname + '/plugins/parse-acf-file.js')
let parseAll = require(__dirname + '/plugins/parse-all.js')

module.exports = function (content, lets, context) {

  assert(content, 'Specify a file path or a Cypher / ACF query')

  let queryType = 'string'
  // render acf file
  if (content.match(/\.acf$/)) {
    queryType = 'file'
    var acfFilePath = process.cwd() + '/' + content
    content = parseAcfFile(acfFilePath, lets, context)
  }
  // process acf query
  else {
    content = parseAll(content, lets, context)
  }

  // content is now a string of query statement(s)
  // generate the transaction array(s)
  return generateTransactions(content)

}

function generateTransactions(content, lets, context) {

  let transactions = []

  // all file and content processing should has been done by now
  // this stage is only for transaction data structure generation
  content = content.trim()

  // convert semicolons to statements
  content = content.replace(/;$/gm, '\n\n')
  // remove excess newlines
  content = content.replace(/\n{3}/gm, '\n\n')

  // convert dashes to transactions
  let transactionIndex = 0
  content.split(/^\-+/gm).forEach(function (transactionString) {

    transactionString = transactionString.trim()

    if (transactionString) {

      let transaction = transactions[transactionIndex] = []
      transaction.statements = []

      transactionString.split('\n\n').forEach(function (statement) {

        statement = statement.trim()

        // don't process empty lines
        if (statement) {

          // include files
          let includes = statement.match(/include \w+.acf/g)

          if (includes) {
            includes.forEach(function (include) {
              let file = cypherFileDir + '/' + include.split(' ')[1]
              statement = statement.replace(include, fs.readFileSync(file))
            })
          }
          transaction.statements.push(statement)
        }

      })

      transactionIndex++
    }

  })

  return transactions

}


