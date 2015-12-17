'use strict'

let Apoc = require(__dirname + '/..')
let chai = require('chai')
let expect = chai.expect

describe('Authentication', function () {

  it('should succeed with correct configurations', function (done) {
    let apoc = new Apoc()
    apoc.query('MATCH (n) RETURN n')
    apoc.exec().then(function (result) {
      expect(result).to.be.an.array
      done()
    }, function (fail) {
      done(fail)
    })
  })

  it('should fail to authenticate with wrong credentials', function (done) {
    let apoc = new Apoc()
    apoc.query('MATCH (n) RETURN n')
    apoc.exec({
      username: ''
    }).then(function (res) {
      done('Should not have authenticated')
    }, function (fail) {
      expect(fail.code).to.equal('Neo.ClientError.Security.AuthorizationFailed')
      done()
    })
  })

})
