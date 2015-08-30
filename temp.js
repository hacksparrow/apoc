var request = require('superagent')
var expect = require('chai').expect
var config = require(__dirname + '/lib/config-reader.js')(__dirname + '/test/fixtures/apoc-config.yml')
var host = config.host
var port = config.port
var username = config.username
var password = config.password
var encodedAuth = 'Basic ' + new Buffer(username + ':' + password).toString('base64')


// get relationships - http://localhost:7474/db/data/relationship/types
// get labels - http://localhost:7474/db/data/labels
// get property keys - http://localhost:7474/db/data/propertykeys
// get data - http://localhost:7474/db/data/
// get version - http://localhost:7474/db/manage/server/version/

// #1 - get the transaction id
var transationInitPath = 'http://' + host + ':' + port + '/db/data/transaction'
request.post(transationInitPath)
.set('Accept', 'application/json')
.set('X-Stream', 'true')
.set('Authorization', encodedAuth)
.send({statements: []})
.end(function (err, res) {
  if (err) return console.log(err)

  // #2 write a node
  var transactionCommitPath = res.body.commit
  request.post(transactionCommitPath)
  .set('Accept', 'application/json')
  .set('X-Stream', 'true')
  .set('Authorization', encodedAuth)
  .send({"statements":[

    {"statement":"create (n:Telugu {word: 'chesta'}) return n","resultDataContents":["row","graph"],"includeStats":true},
    {"statement":"match (a:Telugu {word: 'chesta'}), (b:Tamil {word:'nalla'}) CREATE (a)-[:MATLAB]->(b)","resultDataContents":["row","graph"],"includeStats":true}
    ]})
  .end(function (err, res) {
    if (err) return console.log(err)
    console.log(JSON.stringify(res.body))
  })

})
