'use strict'

let generateTransactions = require(__dirname + '/plugins/generate-transactions.js')
let apocExec = require(__dirname + '/apoc-exec.js')

module.exports = function (input) {

  let transactions = generateTransactions(input)
  let transactionIndex = 0

  return {
    transactions: transactions,
    exec: apocExec
  }

}
