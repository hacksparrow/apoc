var expect = require('chai').expect
var apoc = require('../')

// acf query
var query = apoc.query('main.acf', { twitter: '@hacksparrow', email: 'captain@hacksparrow.com' })
//console.log(query.text)
query.exec().then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

// cypher query
apoc.query('match (n) return n').exec().then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

// insert
var users = [{name: 'A'}, {name: 'B'}, {name: 'C'}]
apoc.insert(users).then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

// describe('apoc module', function () {

//     it('should read and create cypher queries from acf files', function (done) {



//     })

// })


// describe('apoc commandline', function () {

//     it('should execute cypher queries from acf files', function (done) {

//         done()
//     })

//     it('should not execute cypher queries from non-acf files', function (done) {

//         done()
//     })

// })
