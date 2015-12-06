'use strict'

var assert = require('assert')
var query = require(__dirname + '/module-query.js')

module.exports = function (options) {

  var apoc = {

    _plugins: {
      pre: [],
      post: [],
      result: []
    },

    // DONOT use this till it is made public, the interface may be changed in future
    plugin: function (plugin) {

      assert(plugin.phase in this._plugins, ' Invalid plugin phase')
      assert(typeof plugin.code === 'function', ' Plugin code should be a valid function')

      var phase = plugin.phase
      var code = plugin.code

      if (phase === 'pre') {
        this._plugins.pre.push(code)
      }
      else if (phase === 'post') {
        this._plugins.post.push(code)
      }
      else if (phase === 'result') {
        this._plugins.result.push(code)
      }

    },

    options: options || {}

  }

  apoc.query = query(options, apoc._plugins)

  return apoc

}
