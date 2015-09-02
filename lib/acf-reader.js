var fs = require('fs')
var path = require('path')
var parseInclusions = require(__dirname + '/inclusion-parser.js')
var acfscript = require(__dirname + '/acfscript-parser.js')
var template = require(__dirname + '/template.js')
var jscode = require(__dirname + '/jscode.js')
var debug = require('debug')('apoc:acf')

module.exports = function getContent (acfFilePath, vars, context) {

  var statements = []

  if (fs.existsSync(acfFilePath)) {

    var cypherFileDir = path.dirname(acfFilePath)
    var content = fs.readFileSync(acfFilePath).toString()
    content = parseInclusions(content, acfFilePath) // include all files first
    content = removeComments(content) // then remove comments
    content = acfscript(content) // then parse ACFscript

    if (vars) content = template(content, vars) // template
    content = jscode(content, context) // js code

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

function removeComments (content) {
  content = content.trim().replace(/#.*/g, '') // remove # comments
  content = content.trim().replace(/\/\/.*/g, '') // remove // comments
  return content
}
