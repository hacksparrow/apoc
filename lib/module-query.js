'use strict'

var generateTransactions = require(__dirname + '/plugins/generate-transactions.js')
var apocExec = require(__dirname + '/apoc-exec.js')

module.exports = function (options, plugins) {

  return function (input, vars, context) {

    plugins.pre.forEach(function (plugin) {
      input = plugin(input, vars, context)
    })

    var transactions = generateTransactions(input, vars, context)

    plugins.post.forEach(function (plugin) {
      transactions = plugin(transactions, vars, context)
    })

    return {
      plugins: plugins,
      options: options,
      transactions: transactions,
      exec: apocExec
    }

  }

}
