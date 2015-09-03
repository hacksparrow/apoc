/* global describe, it, before, afterEach */

var request = require('superagent')
var apoc = require(__dirname + '/..')
var util = require(__dirname + '/../lib/util.js')
var config = require(__dirname + '/../lib/config-reader.js')(__dirname + '/fixtures/apoc-config.yml')
var protocol = config.protocol
var host = config.host
var port = config.port
var username = config.username
var password = config.password
var encodedAuth = util.getEncodedAuth(username, password)
var crypto = require('crypto')

var chai = require('chai')
var expect = chai.expect

// before anything else, make sure the database server is running and we can connect to it
before(function (done) {
  var path = protocol + '://' + host + ':' + port + '/db'
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
    var query = 'MATCH (n) RETURN n'
    var aq = apoc.query(query)
    expect(query).to.equal(aq.statements[0])
  })

  it('should return a promise', function () {
    var ap = apoc.query('MATCH (n) RETURN n').exec()
    expect(ap).to.have.property('then')
  })

  describe('inline', function () {

    it('should execute query', function (done) {
      apoc.query('MATCH (n) RETURN n').exec(config).then(function (res) {
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with variables', function (done) {
      var x = Math.random()
      var y = Math.random()
      var z = Math.random()
      apoc.query('CREATE (n:ApocTest {x:%x%, y:%y%, z:%z%}) RETURN n',
      {x: x, y: y, z: z}).exec(config).then(function (res) {
        var result = res[0].data[0].row[0]
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
      .exec(config).then(function (res) {
        var result = res[0].data[0].row[0]
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
      .exec(config).then(function (res) {
        var result = res[0].data[0].row[0]
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
      apoc.query(acfPath('simple.acf')).exec(config).then(function (res) {
        expect('Sun').to.equal(res[0].data[0].row[0].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with variables', function (done) {
      var x = Math.random()
      var y = Math.random()
      var z = Math.random()
      apoc.query(acfPath('variables.acf'), {x: x, y: y, z: z})
      .exec(config).then(function (res) {
        var result = res[0].data[0].row[0]
        expect(x).to.equal(result.x)
        expect(y).to.equal(result.y)
        expect(z).to.equal(result.z)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with JavaScript code', function (done) {
      apoc.query(acfPath('jscode.acf')).exec(config).then(function (res) {
        var result = res[0].data[0].row[0]
        expect(result.pi).to.equal(22 / 7)
        expect(result.floor).to.equal(Math.floor(22 / 7))
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute query with JavaScript code with context object', function (done) {
      apoc.query(acfPath('jscode-context.acf'), {}, { versions: process.versions, md5: md5 })
      .exec(config).then(function (res) {
        var result = res[0].data[0].row[0]
        expect(result.node).to.equal(process.versions.node)
        expect(result.md5).to.equal(md5('x'))
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute multiple queries, separated with empty newlines', function (done) {
      var query = apoc.query(acfPath('newlines.acf'))
      query.exec(config).then(function (res) {
        expect('Aankh').to.equal(res[0].data[0].row[0].word)
        expect('Aankh').to.equal(res[1].data[0].row[0].word)
        expect('Kitab').to.equal(res[2].data[0].row[0].word)
        expect('Book').to.equal(res[2].data[0].row[2].word)
        expect('Naina').to.equal(res[3].data[0].row[0].word)
        expect('Eye').to.equal(res[3].data[0].row[2].word)
        expect('Aankh').to.equal(res[4].data[0].row[0].word)
        expect('Chakchu').to.equal(res[4].data[0].row[3].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute multiple queries, separated with semicolons', function (done) {
      var query = apoc.query(acfPath('semicolons.acf'))
      query.exec(config).then(function (res) {
        expect('Aankh').to.equal(res[0].data[0].row[0].word)
        expect('Aankh').to.equal(res[1].data[0].row[0].word)
        expect('Kitab').to.equal(res[2].data[0].row[0].word)
        expect('Book').to.equal(res[2].data[0].row[2].word)
        expect('Naina').to.equal(res[3].data[0].row[0].word)
        expect('Eye').to.equal(res[3].data[0].row[2].word)
        expect('Aankh').to.equal(res[4].data[0].row[0].word)
        expect('Chakchu').to.equal(res[4].data[0].row[3].word)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute queries using included files', function (done) {
      var query = apoc.query(acfPath('inclusion.acf'))
      query.exec(config).then(function (res) {
        expect('World').to.equal(res[0].data[0].row[0].name)
        expect('Asia').to.equal(res[1].data[0].row[0].name)
        expect('India').to.equal(res[2].data[0].row[0].name)
        expect('Misc').to.equal(res[3].data[0].row[0].name)
        expect('Milky Way').to.equal(res[3].data[0].row[0].galaxy)
        expect('foo').to.equal(res[4].data[0].row[0].type)
        expect('Misc').to.equal(res[4].data[0].row[0].name)
        expect('Milky Way').to.equal(res[4].data[0].row[0].galaxy)
        expect('Spain').to.equal(res[5].data[0].row[0].name)
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })

  describe('acfscript', function () {

    it('should support comments', function () {
      var query = apoc.query(acfPath('acfscript.acf'))
      expect(query.statements.length).to.equal(2)
    })

    it('should parse variables', function (done) {
      var query = apoc.query(acfPath('acfscript.acf'))
      query.exec(config).then(function (res) {
        expect(22 / 7).to.equal(res[0].data[0].row[0].pi)
        expect(Math.floor(22 / 7)).to.equal(res[0].data[0].row[0].floor)
        expect('ApocTest').to.equal(res[1].data[0].row[0].label)
        expect(Math.floor(22 / 7)).to.equal(res[1].data[0].row[0].floor)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should support local variables', function (done) {
      var query = apoc.query(acfPath('included-variables.acf'))
      query.exec(config).then(function (res) {
        expect('Sun').to.equal(res[0].data[0].row[0].name)
        expect('Misc').to.equal(res[1].data[0].row[0].name)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should inherit variables', function (done) {
      var query = apoc.query(acfPath('included-variables.acf'))
      query.exec(config).then(function (res) {
        expect('Sun').to.equal(res[0].data[0].row[0].name)
        expect('Misc').to.equal(res[1].data[0].row[0].name)
        expect('Milky Way').to.equal(res[1].data[0].row[0].galaxy)
        expect('foo').to.equal(res[2].data[0].row[0].type)
        expect('Misc').to.equal(res[2].data[0].row[0].name)
        expect('Milky Way').to.equal(res[2].data[0].row[0].galaxy)
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should support global variables', function (done) {
      var query = apoc.query(acfPath('globals.acf'))
      query.exec(config).then(function (res) {
        expect('Universal Brotherhood').to.equal(res[0].data[0].row[0].title)
        expect('Peace and prosperity for mankind').to.equal(res[0].data[0].row[0].subtitle)
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })

  describe.skip('neo4j-shell script', function () {

    it('should parse variables', function (done) {
      var query = apoc.query(acfPath('neo4jshell.acf'))
      query.exec(config).then(function (res) {
        expect(22 / 7).to.equal(res[0].data[0].row[0].pi)
        expect(Math.floor(22 / 7)).to.equal(res[0].data[0].row[0].floor)
        expect('ApocTest').to.equal(res[1].data[0].row[0].label)
        expect(Math.floor(22 / 7)).to.equal(res[1].data[0].row[0].floor)
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })
})

function acfPath (name) {
  return __dirname + '/fixtures/' + name
}

function md5 (input) {
  return crypto.createHash('md5').update(input).digest('hex')
}
