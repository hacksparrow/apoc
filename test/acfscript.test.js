'use strict'

let Apoc = require(__dirname + '/..')
let util = require(__dirname + '/util.js')
let chai = require('chai')
let expect = chai.expect
let md5 = util.md5
let acfPath = util.acfPath

describe('ACFScript', function () {

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

  it('should support comments', function () {
    let apoc = new Apoc()
    apoc.query(acfPath('acfscript.acf'))
    expect(apoc.transactions[0].statements.length).to.equal(2)
  })

  it('should parse variables', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('acfscript.acf'))
    apoc.exec().then(function (res) {
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
    let apoc = new Apoc()
    apoc.query(acfPath('included-variables.acf'))
    apoc.exec().then(function (res) {
      expect('Sun').to.equal(res[0].data[0].row[0].name)
      expect('Misc').to.equal(res[1].data[0].row[0].name)
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should inherit variables', function (done) {
    let apoc = new Apoc()
    apoc.query(acfPath('included-variables.acf'))
    apoc.exec().then(function (res) {
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
    let apoc = new Apoc()
    apoc.query(acfPath('globals.acf'))
    apoc.exec().then(function (res) {
      expect('Universal Brotherhood').to.equal(res[0].data[0].row[0].title)
      expect('Peace and prosperity for mankind').to.equal(res[0].data[0].row[0].subtitle)
      done()
    }, function (fail) {
      done(fail)
    })
  })

})
