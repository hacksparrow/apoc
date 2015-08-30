var fs = require('fs')
var path = require('path')
var template = require(__dirname + '/template.js')
var jscode = require(__dirname + '/jscode.js')

module.exports = function getContent (cypherFilePath, vars) {

  if (fs.existsSync(cypherFilePath)) {

    var cypherFileDir = path.dirname(cypherFilePath)
    var content = fs.readFileSync(cypherFilePath).toString()
    content = content.replace(/\/\/.*/g, '') // remove comments from the main

    // include files
    var includes = content.match(/include \w+.acf/g)

    if (includes) {
      includes.forEach(function (include) {
        var file = cypherFileDir + '/' + include.split(' ')[1]
        content = content.replace(include, fs.readFileSync(file))
      })
    }

    content = content.replace(/\/\/.*/g, '') // remove comments from the included files
    content = content.replace(/\r|\n/g, ' ') // convert new lines to space to preserve continuity
    content = content.replace(/\s{2}/g, '') // remove extra spaces and line breaks

    if (vars) content = template(content, vars) // template

    content = jscode(content) // js code

    return content

  } else {
    throw new Error('File not found: ' + cypherFilePath)
  }

}
