'use strict'

module.exports = function (content) {

  content = content.replace(/^begin/igm, '-\n\n')
  content = content.replace(/^commit/igm, '-\n\n')
  content = content.replace(/^rollback/igm, '-\n\n')
  // content = content.replace(/;\n\n/gm, '\n\-\n')
  content = content.replace(/^export/igm, 'var')

  // remove excess transaction markers
  content = content.replace(/\-\n\-\n/gm, '\n\-\n')

  return content

}
