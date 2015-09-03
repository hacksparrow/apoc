/* globals global */

global.APOC_GLOBAL_VARS = {}

var fs = require('fs')
var path = require('path')
var parseInclusions = require(__dirname + '/inclusion-parser.js')
var acfscript = require(__dirname + '/acfscript-parser.js')
var template = require(__dirname + '/template.js')
var jscode = require(__dirname + '/jscode.js')
var util = require(__dirname + '/util.js')
var debug = require('debug')('apoc:acf')

module.exports = function getContent (acfFilePath, vars, context) {

  var statements = []

  if (fs.existsSync(acfFilePath)) {

    var cypherFileDir = path.dirname(acfFilePath)
    var content = fs.readFileSync(acfFilePath).toString()
    content = util.removeComments(content) // remove comments in this file
    content = parseInclusions(content, acfFilePath) // include files
    content = acfscript(content)

    if (vars) content = template(content, vars) // template
    content = jscode(content, context) // js code

    Object.keys(global.APOC_GLOBAL_VARS).forEach(function (key) {
      var variable = global.APOC_GLOBAL_VARS[key]
      content = content.replace(variable.match, '')
      var re = RegExp('%' + variable.name + '%', 'gm')
      content = content.replace(re, variable.value)
    })

    content = content.replace(/;$/gm, '\n\n')

    content.split('\n\n').forEach(function (statement) {

      statement = statement.trim()

      // don't process empty lines
      if (statement.length > 0) {

        // include files
        var includes = statement.match(/include \w+.acf/g)

        if (includes) {
          includes.forEach(function (include) {
            var file = cypherFileDir + '/' + include.split(' ')[1]
            statement = statement.replace(include, fs.readFileSync(file))
          })
        }
        statements.push(statement)
      }

    })

    debug(statements)

    return statements

  } else {
    throw new Error('File not found: ' + acfFilePath)
  }

}
