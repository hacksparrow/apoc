/* global describe, it */

var fs = require('fs')
var expect = require('chai').expect
var env = process.env
var reader = require(__dirname + '/../lib/config-reader.js')

describe('apoc config reader', function () {

  it('should read config data from a config file', function (done) {
    var configObj = {
      host: '1.2.3.4',
      port: 123456,
      username: 'neo4j',
      password: 'j4neo'
    }
    createConfigFile(configObj)
    var config = reader(__dirname + '/apoc-config.yml')
    expect(config).to.eql(configObj)
    deleteConfigFile()
    done()
  })

  it('should read config data from environment variables', function (done) {
    var configObj = {
      host: '9.8.7.6',
      port: '9876',
      username: 'neo4j',
      password: 'j4neo'
    }
    env.NEO4J_HOST = configObj.host,
    env.NEO4J_PORT = configObj.port,
    env.NEO4J_USERNAME = configObj.username,
    env.NEO4J_PASSWORD = configObj.password
    var config = reader()
    expect(config).to.eql(configObj)
    deleteEnvVars()
    done()
  })

})

function createConfigFile(config) {
  var content = ''
  content += 'host: ' + config.host + '\n'
  content += 'port: ' + config.port + '\n'
  content += 'username: ' + config.username + '\n'
  content += 'password: ' + config.password + '\n'
  fs.writeFileSync(__dirname + '/apoc-config.yml', content)
}

function deleteConfigFile() {
  fs.unlinkSync(__dirname + '/apoc-config.yml')
}

function deleteEnvVars() {
  env.NEO4J_HOST = null
  env.NEO4J_PORT = null
  env.NEO4J_USERNAME = null
  env.NEO4J_PASSWORD = null
}
