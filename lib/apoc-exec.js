'use strict'

let debug = require('debug')('apoc:exec')
let assert = require('assert')
let Q = require('q')
let request = require('superagent')
let util = require(__dirname + '/util.js')
let config = require(__dirname + '/config-reader.js')()
let protocol = config.protocol
let host = config.host
let port = config.port
let username = config.username
let password = config.password
let encodedAuth = util.getEncodedAuth(username, password)

module.exports = class ApocExec {

  constructor(apocInstance, optionsOverride) {

    if (typeof apocInstance.transactions === 'undefined') {
      throw new Error('No transactions defined.')
    }

    let d = Q.defer()

    // optionally overwrite defaults with an optionsOverride object
    if (typeof optionsOverride !== 'undefined') {
      protocol = optionsOverride.protocol || protocol || 'http'
      host = optionsOverride.host || host || 'localhost'
      port = optionsOverride.port || port || 7474
      username = (optionsOverride.username === undefined) ? username : optionsOverride.username
      password = (optionsOverride.password === undefined) ? password : optionsOverride.password
      if (optionsOverride.username !== undefined || optionsOverride.password !== undefined) {
        encodedAuth = util.getEncodedAuth(username, password)
      }
    }

    let transactionIndex = 0
    let transactionsResult = []

    function requestTransaction(statements) {

      let query = {
        statements: []
      }

      statements.forEach(function (statement) {
        query.statements.push({ statement: statement })
      })

      let path = protocol + '://' + host + ':' + port + '/db/data/transaction/commit'

      request.post(path)
      .set('Accept', 'application/json')
      .set('X-Stream', true)
      .set('Authorization', encodedAuth)
      .send(query)
      .on('error', function (err) {
        d.reject(err)
      })
      .end(function (err, res) {

        if (err) return d.reject(err)

        let body = res.body

        if (apocInstance.multipleTransactions) {
          transactionsResult.push(body.results)
        }
        else {
          transactionsResult = body.results
        }

        if (body.errors.length) {
          d.reject(body.errors[0])
        } else {

          if (transactionIndex === apocInstance.transactions.length - 1) {

            // called from a module
            if ('plugins' in apocInstance) {
              apocInstance.plugins.result.forEach(function (plugin) {
                transactionsResult = plugin(transactionsResult)
              })
            }

            d.resolve(transactionsResult)
          }
          else {
            transactionIndex++
            requestTransaction(apocInstance.transactions[transactionIndex].statements)
          }

        }

      })

    }

    requestTransaction(apocInstance.transactions[transactionIndex].statements)

    return d.promise

  }

}
