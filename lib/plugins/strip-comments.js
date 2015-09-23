'use strict'

module.exports = function (content) {

  content = content.trim().replace(/#.*/g, '') // remove # comments
  content = content.trim().replace(/\/\/.*/g, '') // remove // comments
  return content

}
