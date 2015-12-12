'use strict'

let generateTransactions = require(__dirname + '/plugins/generate-transactions.js')
let apocExec = require(__dirname + '/apoc-exec.js')

module.exports = function (plugins) {

  return function (input, variables, context) {

    plugins.pre.forEach(function (plugin) {
      input = plugin(input, variables, context)
    })

    let transactions = generateTransactions(input, variables, context)

    plugins.post.forEach(function (plugin) {
      transactions = plugin(transactions, variables, context)
    })

    return {
      plugins: plugins,
      transactions: transactions,
      exec: apocExec
    }

  }

}
