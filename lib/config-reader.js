var path = require('path-extra')
var fs = require('fs')
var YAML = require('yamljs')
var env = process.env

// not responsible for confirming the existence or the validity of the values
module.exports = function (configFilePath) {

  var host, port, username, password, protocol
  if (!configFilePath) {
    configFilePath = path.homedir() + '/.apoc.yml'
  }

  if (fs.existsSync(configFilePath)) {
    var config = YAML.load(configFilePath)
    protocol = config.protocol
    host = config.host || 'localhost'
    port = config.port || 7474
    username = config.username
    password = config.password
  }

  // the settings from the config file can be overwritten by env vars
  if (env.NEO4J_PROTOCOL) {
    protocol = env.NEO4J_PROTOCOL
  }
  if (env.NEO4J_HOST) {
    host = env.NEO4J_HOST
  }
  if (env.NEO4J_PORT) {
    port = env.NEO4J_PORT
  }
  if (env.NEO4J_USERNAME) {
    username = env.NEO4J_USERNAME
  }
  if (env.NEO4J_PASSWORD) {
    password = env.NEO4J_PASSWORD
  }

  return {
    protocol: protocol,
    host: host,
    port: port,
    username: username,
    password: password
  }

}
