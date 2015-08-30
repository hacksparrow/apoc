var request = require('superagent')
var config = require(__dirname + '/config-reader.js')()
var readAcf = require(__dirname + '/acf-reader.js')

module.exports = function executor (cypherFilePath) {

  var host = config.host
  var port = config.port

  var statement = readAcf(cypherFilePath)
  var query = {
    statements: [ { statement: statement } ]
  }

  var path = 'http://' + host + ':' + port + '/db/data/transaction/commit'

  request.post(path)
  .set('Accept', 'application/json')
  .set('X-Stream', true)
  .send(query)
  .end(function (err, res) {

    if (err) throw new Error(err)
    var body = res.body

    if (body.errors.length) {
      console.log(body.errors)
    } else {
      console.log(body.results)
    }

  })

}
