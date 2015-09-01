var debug = require('debug')('apoc:query')
var assert = require('assert')
var Q = require('q')
var request = require('superagent')
var util = require(__dirname + '/../util.js')
var readAcf = require(__dirname + '/../acf-reader.js')
var acfscript = require(__dirname + '/../acfscript-parser.js')
var template = require(__dirname + '/../template.js')
var jscode = require(__dirname + '/../jscode.js')
var config = require(__dirname + '/../config-reader.js')()
var protocol = config.protocol
var host = config.host
var port = config.port
var username = config.username
var password = config.password
var encodedAuth = util.getEncodedAuth(username, password)

module.exports = function (input, vars, context) {

  assert(input, 'Specify a file path or a Cypher / ACF query')

  var acfQuery = true
  if (!input.match(/acf$/)) acfQuery = false

  var statements = []

  if (acfQuery) {
    readAcf(input, vars, context).forEach(function (statement) {
      statements.push({ statement: statement })
    })
  } else {
    input = acfscript(input) // ACFscript
    if (vars) input = template(input, vars) // template
    input = jscode(input, context) // js code
    statements.push({ statement: input })
  }

  debug('Statements:', JSON.stringify(statements))

  return {

    statements: statements.map(function (statement) {
      return statement.statement
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

      return d.promise

    }

  }

}
