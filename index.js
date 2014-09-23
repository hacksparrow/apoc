#! /usr/bin/env node

var fs = require('fs')
var pack = require(__dirname + '/package.json')
var program = require('commander')
var request = require('superagent')
var Q = require('q')
require('./lib')

program
.version(pack.version)
.option('-h, --host [host]', 'Host. Defaults to localhost.')
.option('-p, --port [port]', 'Port. Defaults to 1337.')
.parse(process.argv);


var template = function (content, vars) {

    var matches = content.match(/%[^%]+%/g)

    matches.forEach(function (match) {
            
        var key = match.replace(/%/g, '')
        content = content.replace(match, vars[key])

    })

    return content
}

var jscode = function (content) {

    var matches = content.match(/`[^`]+`/g)

    if (matches) {
        matches.forEach(function (match) {
            
            var code = match.replace(/`/g, '')
            var e = eval(code) // hopefully eval is justified here
            content = content.replace(match, e)
            
        })
    }

    return content

}

var getContent = function (cypherFilePath, vars) {

    if (fs.existsSync(cypherFilePath)) {
        
        var content = fs.readFileSync(cypherFilePath).toString()
        content = content.replace(/\/\/.*/g, '') // remove comments from the main

        // include files
        var includes = content.match(/include \w+.acf/g)

        if (includes) {
            includes.forEach(function (include) {
                var file = include.split(' ')[1]
                content = content.replace(include, fs.readFileSync(file))
            })
        }

        content = content.replace(/\/\/.*/g, '') // remove comments from the included files
        content = content.replace(/\r|\n/g, ' ') // convert new lines to space to preserve continuity
        content = content.replace(/\s{2}/g, '') // remove extra spaces and line breaks

        if (vars) content = template(content, vars) // template

        content = jscode(content) // js code

        return content

    }
    else {
        throw new Error('File not found: ' + cypherFilePath)
    }

}


// commandline tool
if (require.main == module) {

    if (process.argv.length < 3) {
        program.help()
    }
    else {

        var cypherFilePath = process.argv[2]

        var ext = cypherFilePath.split('.').slice(-1)

        // having an extension helps to ensure we are using the right file
        if (ext == 'acf') {

            var host = program.host || 'localhost'
            var port = program.port || 7474

            var statement = getContent(cypherFilePath)
            var query = {
                statements: [ { statement: statement } ]
            }

            var path = 'http://' + host + ':' + port + '/db/data/transaction/commit'

            request.post(path)
            .set('Accept', 'application/json')
            .set('X-Stream', true)
            .send(query)
            .end(function (err, res) {

                if (err) throw new Error(err)
                var body = res.body

                if (body.errors.length) {
                    console.log(body.errors)
                }
                else {
                    console.log(body.results)
                }

            })

        }

        else {
            console.log('File type ".%s" not supported', ext)
        }
    }
}

// node module
else {

    module.exports = function (input, vars) {

        // TODO: make sure this works
        if (input == undefined) throw new Error('Specify a file path or a Cypher query')

        var queryText
        var acfQuery = true
        var ext = input.split('.').slice(-1)[0]

        // very likely an accidental choice of file type 
        if (ext != 'acf') {
            if (ext.length <= 2) throw new Error('File type ".%s" not supported', ext)
            else acfQuery = false
        }
    
        if (acfQuery) queryText= getContent(input, vars)
        else queryText = input

        return {

            text: queryText,

            exec: function (port, host) {

                var d = Q.defer()

                var host = host || 'localhost'
                var port = port || 7474

                var query = {
                    statements: [ { statement: queryText } ]
                }

                var path = 'http://' + host + ':' + port + '/db/data/transaction/commit'

                request.post(path)
                .set('Accept', 'application/json')
                .set('X-Stream', true)
                .send(query)
                .end(function (err, res) {

                    if (err) return d.reject(err)

                    var body = res.body

                    if (body.errors.length) {
                        d.reject(body.errors)
                    }
                    else {
                        d.resolve(body.results)
                    }

                })

                return d.promise

            }
        }

    }
}


