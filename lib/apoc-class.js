'use strict'

let assert = require('assert')
let generateTransactions = require(__dirname + '/plugins/generate-transactions.js')
let ApocExec = require(__dirname + '/apoc-exec.js')
let Q = require('q')

module.exports = class Apoc {

  constructor () {

    this.plugins = {
      pre: [],
      post: [],
      result: []
    }

  }

  get multipleTransactions() {
    return this._multipleTransactions
  }

  set multipleTransactions(multipleTransactions) {
    this._multipleTransactions = multipleTransactions
  }

  plugin(plugin) {

    assert(plugin.phase in this.plugins, 'Invalid plugin phase')
    assert(typeof plugin.code === 'function', 'Plugin code should be a valid function')

    let phase = plugin.phase
    let code = plugin.code

    if (phase === 'pre') {
      this.plugins.pre.push(code)
    }
    else if (phase === 'post') {
      this.plugins.post.push(code)
    }
    else if (phase === 'result') {
      this.plugins.result.push(code)
    }

  }

  query(input, variables, context) {

    this.plugins.pre.forEach(function (plugin) {
      input = plugin(input, variables, context)
    })

    let transactions = generateTransactions(input, variables, context)

    this.plugins.post.forEach(function (plugin) {
      transactions = plugin(transactions, variables, context)
    })

    if (transactions.length === 1) {
      this.statements = transactions[0].statements
      this.multipleTransactions = false
    }
    else {
      this.multipleTransactions = true
    }

    this.transactions = transactions

    return this

  }

  get transactions() {
    return this._transactions
  }

  set transactions(transactions) {
    this._transactions = transactions
  }

  get statements() {
    return this._statements
  }

  set statements(statements) {
    this._statements = statements
  }

  exec(optionsOverride) {

    return new ApocExec(this, optionsOverride)

  }

}
