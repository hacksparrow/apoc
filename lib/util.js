module.exports = {

  getEncodedAuth: function (username, password) {
    return 'Basic ' + new Buffer(username + ':' + password).toString('base64')
  }

}
