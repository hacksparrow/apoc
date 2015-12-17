'use strict'

let Apoc = require(__dirname + '/..')
let chai = require('chai')
let expect = chai.expect

describe('Apoc', function () {

  it('should return a promise', function () {
    let apoc = new Apoc()
    apoc.query('MATCH (n) RETURN n')
    expect(apoc.exec()).to.have.property('then')
  })

  it('should return query statements', function () {
    let apoc = new Apoc()
    let query = 'MATCH (n) RETURN n'
    apoc.query(query)
    expect(query).to.equal(apoc.transactions[0].statements[0])
  })

  it('should return transactions', function () {
    let apoc = new Apoc()
    let query = 'MATCH (n) RETURN n \n--- MATCH (n) RETURN n'
    apoc.query(query)
    expect(apoc.transactions.length).to.equal(2)
  })

})
