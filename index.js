/**
 * Module Dependencies
 */

var qs = require('querystring')
var debug = require('debug')

/**
 * Export `superagent-trace`
 */

module.exports = trace

/**
 * Initialize the `trace`
 *
 * @param {Superagent} superagent
 * @return {Superagent}
 */

function trace (superagent, log) {
  log = log || debug('superagent:trace')
  log = typeof debug === 'string' ? debug(log) : log
  var end = superagent.Request.prototype.end

  // Monkey-path end
  superagent.Request.prototype.end = function (fn) {
    var url = serialize(this)
    var start = new Date()

    log('--> %s', url)
    end.call(this, function (err, res) {
      if (err) return fn(err, res)
      log('<-- %s (%s)', url, res.status)
      return fn(err, res)
    })
  }

  return superagent
}

/**
 * Serialize the request
 *
 * @param {Object} request
 * @return {String}
 */

function serialize (request) {
  var query = qs.stringify(request.qs)
  return request.method + ' ' + request.url + (query ? '?' + query : '')
}
