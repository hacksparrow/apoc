'use strict'

let Apoc = require(__dirname + '/..')
let util = require(__dirname + '/util.js')
let chai = require('chai')
let expect = chai.expect
let md5 = util.md5
let acfPath = util.acfPath

describe('ACF file', function () {

  afterEach(function (done) {
    let apoc = new Apoc()
    apoc.query('MATCH (a:ApocTest) OPTIONAL MATCH (a)-[r]-(b:ApocTest) DELETE a, r, b')
    apoc.exec().then(function (res) {
      if (res.errors) {
        done(res.errors[0].message)
      } else {
        done()
      }
    }, function (fail) {
      done(fail)
    })
  })

  it('should be executed', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('simple.acf'))
    apoc.exec().then(function (res) {
      expect('Sun').to.equal(res[0].data[0].row[0].word)
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should be executed with variables', function (done) {

    let x = Math.random()
    let y = Math.random()
    let z = Math.random()

    let apoc = new Apoc()
    apoc.query(acfPath('variables.acf'), {x: x, y: y, z: z})
    apoc.exec().then(function (res) {
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
    apoc.query(acfPath('jscode.acf'))
    apoc.exec().then(function (res) {
      let result = res[0].data[0].row[0]
      expect(result.pi).to.equal(22 / 7)
      expect(result.floor).to.equal(Math.floor(22 / 7))
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should be executed query with JavaScript code with context object', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('jscode-context.acf'), {}, { versions: process.versions, md5: md5 })
    apoc.exec().then(function (res) {
      let result = res[0].data[0].row[0]
      expect(result.node).to.equal(process.versions.node)
      expect(result.md5).to.equal(md5('x'))
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should be executed with multiple queries, separated with empty newlines', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('newlines.acf'))
    apoc.exec().then(function (res) {
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

  it('should be executed with multiple queries, separated with semicolons', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('semicolons.acf'))
    apoc.exec().then(function (res) {
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

  it('should be executed using included files', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('inclusion.acf'))
    apoc.exec().then(function (res) {
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

  it('should support multiple transactions', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('multiple-transactions.acf'))
    apoc.exec().then(function (res) {
      expect('Sun').to.equal(res[0][0].data[0].row[0].word)
      expect('Galaxy').to.equal(res[0][1].data[0].row[0].word)
      expect('Moon').to.equal(res[1][0].data[0].row[0].word)
      expect('Star').to.equal(res[2][0].data[0].row[0].word)
      done()
    }, function (fail) {
      done(fail)
    })
  })

})
