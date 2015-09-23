module.exports = function (content) {

  // convert `export` to `var`
  return content.replace(/^export /igm, 'var')

}
