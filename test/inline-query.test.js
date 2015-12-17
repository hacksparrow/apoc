'use strict'

let Apoc = require(__dirname + '/..')
let util = require(__dirname + '/util.js')
let chai = require('chai')
let expect = chai.expect
let md5 = util.md5

describe('Inline query', function () {

  afterEach(function (done) {
    let apoc = new Apoc()
    apoc.query('MATCH (a:ApocTest) OPTIONAL MATCH (a)-[r]-(b:ApocTest) DELETE a, r, b').exec().then(function (res) {
      if (res.errors) {
        done(res.errors[0].message)
      } else {
        done()
      }
    }, function (fail) {
      done(fail)
    })
  })

  // exec() chained to query(), to demonstrate its chainability

  it('should be executed', function (done) {
    let apoc = new Apoc()
    apoc.query('MATCH (n) RETURN n')
    .exec().then(function (res) {
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should be executed with variables', function (done) {

    let x = Math.random()
    let y = Math.random()
    let z = Math.random()
    let values = {x: x, y: y, z: z}

    let apoc = new Apoc()
    apoc.query('CREATE (n:ApocTest {x:{x}, y:{y}, z:{z}}) RETURN n', values)
    .exec().then(function (res) {
      let result = res[0].data[0].row[0]
      expect(x).to.equal(result.x)
      expect(y).to.equal(result.y)
      expect(z).to.equal(result.z)
      done()
    }, function (fail) {
      done(fail)
    })

  })

  it('should be executed with JavaScript code', function (done) {
    let apoc = new Apoc()
    apoc.query('CREATE(n:ApocTest { pi: `22/7`, floor: `Math.floor(22/7)` }) RETURN n')
    .exec().then(function (res) {
      let result = res[0].data[0].row[0]
      expect(result.pi).to.equal(22 / 7)
      expect(result.floor).to.equal(Math.floor(22 / 7))
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should execute query with enhanced JavaScript API', function (done) {
    let apoc = new Apoc()
    apoc.query('CREATE(n:ApocTest { node: "`versions.node`", md5: "`md5("x")`" }) RETURN n',
    {}, { versions: process.versions, md5: md5 })
    .exec().then(function (res) {
      let result = res[0].data[0].row[0]
      expect(result.node).to.equal(process.versions.node)
      expect(result.md5).to.equal(md5('x'))
      done()
    }, function (fail) {
      done(fail)
    })
  })

})
