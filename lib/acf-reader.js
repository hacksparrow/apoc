var fs = require('fs')
var path = require('path')
var template = require(__dirname + '/template.js')
var jscode = require(__dirname + '/jscode.js')

module.exports = function getContent (cypherFilePath, vars) {

  var statements = []

  if (fs.existsSync(cypherFilePath)) {

    var cypherFileDir = path.dirname(cypherFilePath)
    var content = fs.readFileSync(cypherFilePath).toString()

    content.split('\n\n').forEach(function (statement) {

      statement = statement.trim().replace(/\/\/.*/g, '') // remove comments from the main

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

        statement = statement.replace(/\/\/.*/g, '') // remove comments from the included files
        statement = statement.replace(/\r|\n/g, ' ') // convert new lines to space to preserve continuity
        statement = statement.replace(/\s{2}/g, '') // remove extra spaces and line breaks

        if (vars) statement = template(statement, vars) // template
        statement = jscode(statement) // js code

        statements.push(statement)
      }

    })

    return statements

  } else {
    throw new Error('File not found: ' + cypherFilePath)
  }

}
