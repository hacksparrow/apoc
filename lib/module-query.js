'use strict'

let generateTransactions = require(__dirname + '/plugins/generate-transactions.js')
let apocExec = require(__dirname + '/apoc-exec.js')

module.exports = function (plugins) {

  return function (input, lets, context) {

    plugins.pre.forEach(function (plugin) {
      input = plugin(input, lets, context)
    })

    let transactions = generateTransactions(input, lets, context)

    plugins.post.forEach(function (plugin) {
      transactions = plugin(transactions, lets, context)
    })

    return {
      plugins: plugins,
      transactions: transactions,
      exec: apocExec
    }

  }

}
