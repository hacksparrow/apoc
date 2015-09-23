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

module.exports = function (plugins) {
console.log(plugins)
process.exit()

  return function (input, vars, context) {

    plugins.pre.forEach(function (plugin) {
      input = plugin(input, vars, context)
    })

    // effects only root-level code
    plugins.defaults.forEach(function (plugin) {
      input = plugin(input, vars, context)
    })

    var transactions = generateTransactions(input, vars, context)

    plugins.post.forEach(function (plugin) {
      input = plugin(transactions, vars, context)
    })

    console.log(input)
    process.exit()

    return {

      transactions: transactions.map(function (transaction) {
        return transaction.map(function (statement) {
          return statement.statement
        })
      }),

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

        transactions.forEach(function (transaction) {

          var query = {
            statements: statements
          }

          var path = protocol + '://' + host + ':' + port + '/db/data/transaction/commit'
          request.post(path)
          .set('Accept', 'application/json')
          .set('X-Stream', true)
          .set('Authorization', encodedAuth)
          .send(query)
          .end(function (err, res) {

            if (err) return d.reject(err)

            var body = res.body

            if (body.errors.length) {
              d.reject(body.errors[0])
            } else {
              d.resolve(body.results)
            }

          })

        })

        return d.promise

      }

    }

  }

}
