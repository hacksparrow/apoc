'use strict'

var debug = require('debug')('apoc:query')
var assert = require('assert')
var Q = require('q')
var request = require('superagent')
var util = require(__dirname + '/util.js')
var config = require(__dirname + '/config-reader.js')()
var protocol = config.protocol
var host = config.host
var port = config.port
var username = config.username
var password = config.password
var encodedAuth = util.getEncodedAuth(username, password)
var generateTransactions = require(__dirname + '/plugins/generate-transactions.js')

module.exports = function (input) {

  var transactions = generateTransactions(input)
  var transactionIndex = 0

  return {

    transactions: transactions,

    exec: function (options) {

      var d = Q.defer()

      // optionally overwrite defaults with an options object
      if (options) {
        protocol = options.protocol || protocol || 'http'
        host = options.host || host || 'localhost'
        port = options.port || port || 7474
        username = (options.username === undefined) ? username : options.username
        password = (options.password === undefined) ? password : options.password
        if (options.username !== undefined || options.password !== undefined) {
          encodedAuth = util.getEncodedAuth(username, password)
        }
      }

      var transactionsResult = []

      function requestTransaction(statements) {

        var query = {
          statements: []
        }

        statements.forEach(function (statement) {
          query.statements.push({ statement: statement })
        })

        var path = protocol + '://' + host + ':' + port + '/db/data/transaction/commit'
        request.post(path)
        .set('Accept', 'application/json')
        .set('X-Stream', true)
        .set('Authorization', encodedAuth)
        .send(query)
        .end(function (err, res) {

          if (err) return d.reject(err)

          var body = res.body
          transactionsResult.push(body.results)

          if (body.errors.length) {
            d.reject(body.errors[0])
          } else {

            if (transactionIndex === transactions.length - 1) {
              d.resolve(transactionsResult)
            }
            else {
              transactionIndex++
              requestTransaction(transactions[transactionIndex].statements)
            }

          }

        })

      }

      requestTransaction(transactions[transactionIndex].statements)

      return d.promise

    }

  }

}
