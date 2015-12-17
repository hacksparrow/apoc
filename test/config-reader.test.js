/* global describe, it */

'use strict'

let fs = require('fs')
let expect = require('chai').expect
let env = process.env
let reader = require(__dirname + '/../lib/config-reader.js')

describe('Config reader', function () {

  it('should read config data from a config file', function (done) {
    let configObj = {
      protocol: 'http',
      host: 'localhost',
      port: 7474,
      username: 'neo4j',
      password: 'j4neo'
    }
    createConfigFile(configObj)
    let config = reader(__dirname + '/apoc-config.yml')
    expect(config).to.eql(configObj)
    deleteConfigFile()
    done()
  })

  it('should read config data from environment variables', function (done) {
    let configObj = {
      protocol: 'https',
      host: 'localhost',
      port: '7474',
      username: 'neo4j',
      password: 'j4neo'
    }
    env.NEO4J_PROTOCOL = configObj.protocol
    env.NEO4J_HOST = configObj.host
    env.NEO4J_PORT = configObj.port
    env.NEO4J_USERNAME = configObj.username
    env.NEO4J_PASSWORD = configObj.password
    let config = reader()
    expect(config).to.eql(configObj)
    deleteEnvVars()
    done()
  })

})

function createConfigFile (config) {
  let content = ''
  content += 'protocol: ' + config.protocol + '\n'
  content += 'host: ' + config.host + '\n'
  content += 'port: ' + config.port + '\n'
  content += 'username: ' + config.username + '\n'
  content += 'password: ' + config.password + '\n'
  fs.writeFileSync(__dirname + '/apoc-config.yml', content)
}

function deleteConfigFile () {
  fs.unlinkSync(__dirname + '/apoc-config.yml')
}

function deleteEnvVars () {
  env.NEO4J_HOST = null
  env.NEO4J_PORT = null
  env.NEO4J_USERNAME = null
  env.NEO4J_PASSWORD = null
}
