module.exports = function template (content, vars) {

  var matches = content.match(/%[^%]+%/g)
  matches.forEach(function (match) {
    var key = match.replace(/%/g, '')
    content = content.replace(match, vars[key])
  })

  return content
}
