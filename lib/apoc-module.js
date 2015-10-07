'use strict'

var plugins = {
  preprocess: [],
  postprocess: [],
  result: []
}

var query = require(__dirname + '/module-query.js')(plugins)

module.exports = {

  plugin: function (phase, plugin) {

    if (phase === 'preprocess') {
      plugins.preprocess.push(plugin)
    }
    else if (phase === 'postprocess') {
      plugins.postprocess.push(plugin)
    }
    else if (phase === 'result') {
      plugins.result.push(plugin)
    }

  },

  query: query

}
