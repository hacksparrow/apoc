var expect = require('chai').expect
var apoc = require('../')

// acf query
var query = apoc('main.acf', { twitter: '@hacksparrow', email: 'captain@hacksparrow.com' })
//console.log(query.text)
query.exec().then(function (response) {
    console.log(response)
}, function (fail) {
    console.log(fail)
})

// cypher query
apoc('match (n) return n').exec().then(function (response) {
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
