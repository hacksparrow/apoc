'use strict'

var query = require(__dirname + '/module-query.js')

module.exports = function (options) {

  var apoc = {

    _plugins: {
      preprocess: [],
      postprocess: [],
      result: []
    },

    // DONOT use this till it is made public, the interface may be changed in future
    plugin: function (phase, plugin) {

      if (phase === 'preprocess') {
        this._plugins.preprocess.push(plugin)
      }
      else if (phase === 'postprocess') {
        this._plugins.postprocess.push(plugin)
      }
      else if (phase === 'result') {
        this._plugins.result.push(plugin)
      }

    },

    options: options || {}

  }

  apoc.query = query(options, apoc._plugins)

  return apoc

}
