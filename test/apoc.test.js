/* global describe, it */

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

var chai = require('chai')
var expect = chai.expect
var chaiAsPromised = require('chai-as-promised');
    chai.use(chaiAsPromised);
    chai.should();

// before anything else, make sure the database server is running and we can connect to it
before(function (done) {
  var path = 'http://' + host + ':' + port + '/db'
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

  afterEach(function(done) {
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
  })

  describe('acf', function () {

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
        expect(result.pi).to.equal(22/7)
        expect(result.floor).to.equal(Math.floor(22/7))
        done()
      }, function (fail) {
        done(fail)
      })
    })

    it('should execute multiple queries', function (done) {
      var query = apoc.query(acfPath('multiline.acf'))
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

    it.skip('should include files', function (done) {
      apoc.query(acfPath('inclusion.acf')).exec(config).then(function (res) {
        console.log(res)
        done()
      }, function (fail) {
        done(fail)
      })
    })

  })

})

function acfPath(name) {
  return __dirname + '/fixtures/' + name
}
