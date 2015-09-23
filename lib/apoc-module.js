'use strict'

var plugins = {
  pre: [],
  post: []
}

var query = require(__dirname + '/query.js')(plugins)

module.exports = {

  plugin: function (phase, plugin) {

    if (phase === 'pre') {
      plugins.pre.push(plugin)
    } else (phase === 'post') {
      plugins.post.push(plugin)
    }

  },

  query: query

}
