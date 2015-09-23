'use strict'

module.exports = function (content) {

  content = content.replace(/^begin/igm, '-\n\n')
  content = content.replace(/^rollback|^commit/igm, '-\n\n')

  content = content.replace(/^export/igm, 'var')

  return content

}
