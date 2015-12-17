'use strict'

let Apoc = require(__dirname + '/..')
let chai = require('chai')
let expect = chai.expect

describe('Plugins', function () {

  it('loaded in PREprocessing phase should be executed', function () {
    let apoc = new Apoc()
    apoc.plugin({
      phase: 'pre',
      code: function (content) {
        return 'MATCH (x) RETURN x'
      }
    })
    apoc.query('MATCH (n) RETURN n')
    expect(apoc.statements[0]).to.equal('MATCH (x) RETURN x')
  })

  it('loaded in POSTprocessing phase should be executed', function () {
    let apoc = new Apoc()
    apoc.plugin({
      phase: 'post',
      code: function (transactions) {
        return []
      }
    })
    apoc.query('MATCH (n) RETURN n')
    expect(apoc.transactions).to.be.empty
  })

  it('loaded in result phase should be executed', function (done) {
    let apoc = new Apoc()
    apoc.plugin({
      phase: 'result',
      code: function (result) {
        return []
      }
    })
    apoc.query('MATCH (n) RETURN n')
    apoc.exec().then(function (res) {
      expect(res).to.be.empty
      done()
    }, function (fail) {
      done(fail)
    })
  })

})
