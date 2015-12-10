/* global describe, it, before, afterEach */

'use strict'

let request = require('superagent')
let util = require(__dirname + '/../lib/util.js')
let config = require(__dirname + '/../lib/config-reader.js')(__dirname + '/fixtures/apoc-config.yml')
let protocol = config.protocol
let host = config.host
let port = config.port
let username = config.username
let password = config.password
let encodedAuth = util.getEncodedAuth(username, password)
let crypto = require('crypto')
let apoc = require(__dirname + '/..')(config)

let chai = require('chai')
let expect = chai.expect

// before anything else, make sure the database server is running and we can connect to it
before(function (done) {
  let path = protocol + '://' + host + ':' + port + '/db'
  request.post(path)
  .set('Accept', 'application/json')
  .set('X-Stream', 'true')
  .set('Authorization', encodedAuth)
  .end(function (err, res) {
    if (err) {
      done(err.message)
    } else if (res.body.errors) {
      done(res.body.errors[0].message)
    } else {
      done()
    }
  })
})

describe('apoc', function () {

  afterEach(function (done) {
    apoc.query('MATCH (a:ApocTest) OPTIONAL MATCH (a)-[r]-(b:ApocTest) DELETE a, r, b')
    .exec(config).then(function (res) {
      if (res.errors) {
        done(res.errors[0].message)
      } else {
        done()
      }
    }, function (fail) {
      done(fail)
    })
  })

  it('should fail to authenticate with wrong credentials', function (done) {
    apoc.query('MATCH (n) RETURN n').exec({
      username: '',
      password: ''
    }).then(function (res) {
      done('Should not have authenticated')
    }, function (fail) {
      expect(fail.code).to.equal('Neo.ClientError.Security.AuthorizationFailed')
      done()
    })
  })

  it('should return query statements', function () {
    let query = 'MATCH (n) RETURN n'
    let aq = apoc.query(query)
    expect(query).to.equal(aq.transactions[0].statements[0])
  })

  it('should return a promise', function () {
    let ap = apoc.query('MATCH (n) RETURN n').exec()
    expect(ap).to.have.property('then')
  })

  describe('inline', function () {

    it('should execute query', function (done) {
      apoc.query('MATCH (n) RETURN n').exec().then(function (res) {
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with variables', function (done) {

      let x = Math.random()
      let y = Math.random()
      let z = Math.random()
      let values = {x: x, y: y, z: z}

      apoc.query('CREATE (n:ApocTest {x:{x}, y:{y}, z:{z}}) RETURN n', values)
        .exec().then(function (res) {
        let result = res[0][0].data[0].row[0]
        expect(x).to.equal(result.x)
        expect(y).to.equal(result.y)
        expect(z).to.equal(result.z)
        done()
      }, function (fail) {
        done(fail)
      })

    })

    it('should execute query with JavaScript code', function (done) {
      apoc.query('CREATE(n:ApocTest { pi: `22/7`, floor: `Math.floor(22/7)` }) RETURN n')
      .exec().then(function (res) {
        let result = res[0][0].data[0].row[0]
        expect(result.pi).to.equal(22 / 7)
        expect(result.floor).to.equal(Math.floor(22 / 7))
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with enhanced JavaScript API', function (done) {
      apoc.query('CREATE(n:ApocTest { node: "`versions.node`", md5: "`md5("x")`" }) RETURN n',
      {}, { versions: process.versions, md5: md5 })
      .exec().then(function (res) {
        let result = res[0][0].data[0].row[0]
        expect(result.node).to.equal(process.versions.node)
        expect(result.md5).to.equal(md5('x'))
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })

  describe('acf file', function () {

    it('should execute query', function (done) {
      apoc.query(acfPath('simple.acf')).exec().then(function (res) {
        expect('Sun').to.equal(res[0][0].data[0].row[0].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with variables', function (done) {
      let x = Math.random()
      let y = Math.random()
      let z = Math.random()
      apoc.query(acfPath('variables.acf'), {x: x, y: y, z: z})
      .exec().then(function (res) {
        let result = res[0][0].data[0].row[0]
        expect(x).to.equal(result.x)
        expect(y).to.equal(result.y)
        expect(z).to.equal(result.z)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with JavaScript code', function (done) {
      apoc.query(acfPath('jscode.acf')).exec().then(function (res) {
        let result = res[0][0].data[0].row[0]
        expect(result.pi).to.equal(22 / 7)
        expect(result.floor).to.equal(Math.floor(22 / 7))
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with JavaScript code with context object', function (done) {
      apoc.query(acfPath('jscode-context.acf'), {}, { versions: process.versions, md5: md5 })
      .exec().then(function (res) {
        let result = res[0][0].data[0].row[0]
        expect(result.node).to.equal(process.versions.node)
        expect(result.md5).to.equal(md5('x'))
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute multiple queries, separated with empty newlines', function (done) {
      let query = apoc.query(acfPath('newlines.acf'))
      query.exec().then(function (res) {
        let result = res[0]
        expect('Aankh').to.equal(result[0].data[0].row[0].word)
        expect('Aankh').to.equal(result[1].data[0].row[0].word)
        expect('Kitab').to.equal(result[2].data[0].row[0].word)
        expect('Book').to.equal(result[2].data[0].row[2].word)
        expect('Naina').to.equal(result[3].data[0].row[0].word)
        expect('Eye').to.equal(result[3].data[0].row[2].word)
        expect('Aankh').to.equal(result[4].data[0].row[0].word)
        expect('Chakchu').to.equal(result[4].data[0].row[3].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute multiple queries, separated with semicolons', function (done) {
      let query = apoc.query(acfPath('semicolons.acf'))
      query.exec(config).then(function (res) {
        let result = res[0]
        expect('Aankh').to.equal(result[0].data[0].row[0].word)
        expect('Aankh').to.equal(result[1].data[0].row[0].word)
        expect('Kitab').to.equal(result[2].data[0].row[0].word)
        expect('Book').to.equal(result[2].data[0].row[2].word)
        expect('Naina').to.equal(result[3].data[0].row[0].word)
        expect('Eye').to.equal(result[3].data[0].row[2].word)
        expect('Aankh').to.equal(result[4].data[0].row[0].word)
        expect('Chakchu').to.equal(result[4].data[0].row[3].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute queries using included files', function (done) {
      let query = apoc.query(acfPath('inclusion.acf'))
      query.exec(config).then(function (res) {
        let result = res[0]
        expect('World').to.equal(result[0].data[0].row[0].name)
        expect('Asia').to.equal(result[1].data[0].row[0].name)
        expect('India').to.equal(result[2].data[0].row[0].name)
        expect('Misc').to.equal(result[3].data[0].row[0].name)
        expect('Milky Way').to.equal(result[3].data[0].row[0].galaxy)
        expect('foo').to.equal(result[4].data[0].row[0].type)
        expect('Misc').to.equal(result[4].data[0].row[0].name)
        expect('Milky Way').to.equal(result[4].data[0].row[0].galaxy)
        expect('Spain').to.equal(result[5].data[0].row[0].name)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should support multiple transactions', function (done) {
      let query = apoc.query(acfPath('multiple-transactions.acf'))
      query.exec(config).then(function (res) {
        expect('Sun').to.equal(res[0][0].data[0].row[0].word)
        expect('Moon').to.equal(res[1][0].data[0].row[0].word)
        expect('Star').to.equal(res[2][0].data[0].row[0].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })

  describe('acfscript', function () {

    it('should support comments', function () {
      let query = apoc.query(acfPath('acfscript.acf'))
      expect(query.transactions[0].statements.length).to.equal(2)
    })

    it('should parse variables', function (done) {
      let query = apoc.query(acfPath('acfscript.acf'))
      query.exec(config).then(function (res) {
        expect(22 / 7).to.equal(res[0][0].data[0].row[0].pi)
        expect(Math.floor(22 / 7)).to.equal(res[0][0].data[0].row[0].floor)
        expect('ApocTest').to.equal(res[0][1].data[0].row[0].label)
        expect(Math.floor(22 / 7)).to.equal(res[0][1].data[0].row[0].floor)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should support local variables', function (done) {
      let query = apoc.query(acfPath('included-variables.acf'))
      query.exec(config).then(function (res) {
        expect('Sun').to.equal(res[0][0].data[0].row[0].name)
        expect('Misc').to.equal(res[0][1].data[0].row[0].name)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should inherit variables', function (done) {
      let query = apoc.query(acfPath('included-variables.acf'))
      query.exec(config).then(function (res) {
        let result = res[0]
        expect('Sun').to.equal(result[0].data[0].row[0].name)
        expect('Misc').to.equal(result[1].data[0].row[0].name)
        expect('Milky Way').to.equal(result[1].data[0].row[0].galaxy)
        expect('foo').to.equal(result[2].data[0].row[0].type)
        expect('Misc').to.equal(result[2].data[0].row[0].name)
        expect('Milky Way').to.equal(result[2].data[0].row[0].galaxy)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should support global variables', function (done) {
      let query = apoc.query(acfPath('globals.acf'))
      query.exec(config).then(function (res) {
        expect('Universal Brotherhood').to.equal(res[0][0].data[0].row[0].title)
        expect('Peace and prosperity for mankind').to.equal(res[0][0].data[0].row[0].subtitle)
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })

  // describe.skip('neo4j-shell script', function () {

  //   it('should parse variables', function (done) {
  //     apoc.plugin('start', __dirname + '/plugins/apoc-neo4j-shell.js')
  //     apoc.query(acfPath('neo4j-shell.acf'))
  //     done()
  //   })

  // })

})

function acfPath (name) {
  return __dirname + '/fixtures/' + name
}

function md5 (input) {
  return crypto.createHash('md5').update(input).digest('hex')
}
