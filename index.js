#! /usr/bin/env node


var fs = require('fs')
var spawn = require('child_process').spawn
var pack = require(__dirname + '/package.json')
var program = require('commander');

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
        program.help()
    }
    else {

        var cypherFilePath = process.argv[2]

        var ext = cypherFilePath.split('.').slice(-1)

        // having an extension helps to ensure we are using the right file
        if (ext == 'acf') {

            // commandline query has to be quoted and terminated with a new line
            var query = '"' + getContent(cypherFilePath).replace(/"/g, '\"') + '"\n';

            var host = program.host || 'localhost'
            var port = program.port || 1337

            console.log(query)

            // the easier -c option of writing to neo4j-shell is not working for some reason
            var shell = spawn('neo4j-shell', ['-host', host, '-port', port])

            var written = false;
            shell.stdout.on('data', function (data) {

                data = data.toString()

                if ((data.indexOf('neo4j-sh') > -1) && (written == false)) {
                    written = true
                    shell.stdin.write(query)
                }
                console.log(written, data)
            })

            shell.stdout.on('end', function () {
                console.log(written, 'END')
            })

            shell.stdout.on('error', function (error) {
                console.log(error.toString())
            })

            shell.on('exit', function (code) {
                if (code != 0) console.log('Error: ', code)
            })

        }

        else {
            console.log('File type ".%s" not supported', ext);
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


