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

  it('should return `statements` from a single transaction', function () {
    let apoc = new Apoc()
    let query = 'MATCH (n) RETURN'
    apoc.query(query)
    expect(apoc.statements[0]).to.equal(query)
  })

  it('should not return `statements` from multiple transactions', function () {
    let apoc = new Apoc()
    let query = 'MATCH (n) RETURN n \n--- MATCH (n) RETURN n'
    apoc.query(query)
    expect(apoc.statements).to.be.undefined
  })

  it('should return `transactions` from single-transaction query', function () {
    let apoc = new Apoc()
    let query = 'MATCH (n) RETURN n'
    apoc.query(query)
    expect(query).to.equal(apoc.transactions[0].statements[0])
  })

  it('should return `transactions` from multi-transaction query', function () {
    let apoc = new Apoc()
    let query = 'MATCH (n) RETURN n \n--- MATCH (n) RETURN n'
    apoc.query(query)
    expect(apoc.transactions.length).to.equal(2)
  })

  it('should overwrite old query with new', function () {
    let apoc = new Apoc()
    let query0 = 'MATCH (n) RETURN'
    apoc.query(query0)
    expect(apoc.statements[0]).to.equal(query0)
    let query1 = 'MATCH (x) RETURN'
    apoc.query(query1)
    expect(apoc.statements[0]).to.equal(query1)
  })

})
