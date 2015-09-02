module.exports = {

  getEncodedAuth: function (username, password) {
    return 'Basic ' + new Buffer(username + ':' + password).toString('base64')
  },

  removeComments: function (content) {
    content = content.trim().replace(/#.*/g, '') // remove # comments
    content = content.trim().replace(/\/\/.*/g, '') // remove // comments
    return content
  }

}
