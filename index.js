#! /usr/bin/env node

var fs = require('fs')
var spawn = require('child_process').spawn

var getContent = function (cypherFilePath) {

    if (fs.existsSync(cypherFilePath)) {
        
        var content = fs.readFileSync(cypherFilePath).toString()

        // include files
        var includes = content.match(/include \w+.acf/g)

        if (includes) {
            includes.forEach(function (include) {
                var file = include.split(' ')[1]
                content = content.replace(include, fs.readFileSync(file))
            })
        }

        content = content.replace(/\/\/.*/g, '') // remove comments
        content = content.replace(/\r|\n/g, '') // remove line breaks
        content = content.replace(/\s{2}/g, '') // remove extra spaces and line breaks
        
        content += ';' // terminate the query

        return content

    }
    else {
        throw new Error('File not found: ' + cypherFilePath)
    }

}


// commandline tool
if (require.main == module) {

    if (process.argv.length < 3) {
        console.log('\n Usage: apoc <file>\n')
    }
    else {

        var cypherFilePath = process.argv[2]
        var query = '"' + getContent(cypherFilePath).replace(/"/g, '\"') + '"';

        var shell = spawn('neo4j-shell', ['-c', query])

        shell.stdout.on('data', function (data) {
            console.log(data.toString())
        })

        shell.stdout.on('error', function (error) {
            console.log(error.toString())
        })

        shell.on('exit', function (code) {
            if (code != 0) console.log('Error: ', code)
        })

    }
}

// node module
else {

    module.exports = function (cypherFilePath) {

        return getContent(cypherFilePath)

    }
}


