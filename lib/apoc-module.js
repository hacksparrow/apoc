'use strict'

var stripComments = require(__dirname + '/plugins/strip-comments.js')
var parseJavaScript = require(__dirname + '/plugins/parse-javascript.js')
var parseJs = require(__dirname + '/parse-js.js')
var parseInclusions = require(__dirname + '/parse-inclusions.js')
var parseAcfScript = require(__dirname + '/parse-acfscript.js')
var parseTemplate = require(__dirname + '/parse-template.js')
var parseGlobals = require(__dirname + '/parse-globals.js')

var plugins = {

  pre: [],
  defaults: [
    stripComments,
    parseInclusions,
    parseAcfScript,
    parseTemplate,
    parseJavaScript
  ],
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
