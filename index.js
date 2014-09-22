#! /usr/bin/env node

var fs = require('fs')
var pack = require(__dirname + '/package.json')
var program = require('commander')
var request = require('superagent')
var table = require('text-table')

program
.version(pack.version)
.option('-h, --host [host]', 'Host. Defaults to localhost.')
.option('-p, --port [port]', 'Port. Defaults to 1337.')
.parse(process.argv);

var getContent = function (cypherFilePath) {

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
        content = content.replace(/\r|\n/g, '') // remove line breaks
        content = content.replace(/\s{2}/g, '') // remove extra spaces and line breaks

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

    module.exports = function (cypherFilePath) {

        var ext = cypherFilePath.split('.').slice(-1)

        // having an extension helps to ensure we are using the right file
        if (ext == 'acf') return getContent(cypherFilePath)
        else throw new Error('File type ".%s" not supported', ext)
        
    }
}


