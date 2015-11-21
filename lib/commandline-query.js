'use strict'

var generateTransactions = require(__dirname + '/plugins/generate-transactions.js')
var apocExec = require(__dirname + '/apoc-exec.js')

module.exports = function (input) {

  var transactions = generateTransactions(input)
  var transactionIndex = 0

  return {
    transactions: transactions,
    exec: apocExec
  }

}
