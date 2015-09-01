var jscode = require(__dirname + '/jscode.js')

module.exports = function (content) {

  var parsed = content

  var matches = content.match(/var \w+.+\n/gm)

  if (matches) {
    matches.forEach(function (match) {
      var temp = match.split('=')
      var varName = temp[0].split(' ')[1]
      var varValue = jscode(temp[1].trim())
      parsed = parsed.replace(match, '')
      var re = RegExp('%' + varName + '%', 'gm')
      parsed = parsed.replace(re, varValue)
    })
  }

  return parsed

}
