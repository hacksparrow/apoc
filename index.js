#! /usr/bin/env node

var path = require('path')
var pkg = require(__dirname + '/package.json')
var program = require('commander')
var executeCommand = require(__dirname + '/lib/executor.js')
require(__dirname + '/lib/crypto.js')

program
.version(pkg.version)
.option('-h, --host [host]', 'Host. Defaults to localhost')
.option('-p, --port [port]', 'Port. Defaults to 1337')
.parse(process.argv)

// commandline tool
if (require.main === module) {
  if (process.argv.length < 3) {
    program.help()
  } else {
    var cypherFilePath = process.argv[2]
    var ext = path.extname(cypherFilePath)

    // having an extension helps to ensure we are using the right file
    if (ext === 'acf') {
      executeCommand(cypherFilePath)
    } else {
      console.log('File type ".%s" not supported', ext)
    }
  }
} else {
  module.exports = require(__dirname + '/lib/apoc-module.js')
}
