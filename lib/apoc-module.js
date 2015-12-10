'use strict'

let assert = require('assert')
let query = require(__dirname + '/module-query.js')

module.exports = function () {

  let apoc = {

    _plugins: {
      pre: [],
      post: [],
      result: []
    },

    plugin: function (plugin) {

      assert(plugin.phase in this._plugins, ' Invalid plugin phase')
      assert(typeof plugin.code === 'function', ' Plugin code should be a valid function')

      let phase = plugin.phase
      let code = plugin.code

      if (phase === 'pre') {
        this._plugins.pre.push(code)
      }
      else if (phase === 'post') {
        this._plugins.post.push(code)
      }
      else if (phase === 'result') {
        this._plugins.result.push(code)
      }

    }

  }

  apoc.query = query(apoc._plugins)

  return apoc

}
