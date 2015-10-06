'use strict'

module.exports = function (content) {

  content = content.replace(/^begin/igm, '-\n\n')
  content = content.replace(/^commit/igm, '-\n\n')
  content = content.replace(/^rollback/igm, '-\n\n')
  // content = content.replace(/;\n\n/gm, '\n\-\n')
  // string exports
  var exports = content.match(/^export \w+=\w+\n/igm)
  if (exports) {
    exports.forEach(function (match) {
      var acfCode = match.replace('=', '="').replace('\n', '"\n')
      content = content.replace(match, acfCode)
    })
  }
  // array exports
  content = content.replace(/^export/igm, 'var')

  // remove excess transaction markers
  content = content.replace(/\-\n\-\n/gm, '\n\-\n')

  return content

}
