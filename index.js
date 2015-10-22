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
 * @param {Object} options
 * @return {Superagent}
 */

function trace (superagent, options) {
  options = options || {}

  // options.logging
  var log = options.log || debug('superagent:trace')
  log = typeof debug === 'string' ? debug(log) : log

  // options.verbose
  var verbose = options.verbose === undefined ? false : options.verbose

  // options.slow
  var slow = options.slow || 1000

  // Monkey-path end
  var end = superagent.Request.prototype.end
  superagent.Request.prototype.end = function (fn) {
    var url = serialize(this)
    var start = new Date()

    verbose && log('--> %s', url)
    end.call(this, function (err, res) {
      var time = res && res.headers && res.headers['x-response-time']
      if (err) {
        time
          ? log('-x- %s (%s %s)', url, res.status, time)
          : log('-x- %s (%s)', url, res.status)
        return fn(err, res)
      } else {
        time
          ? log('<-- %s (%s %s)', url, res.status, time)
          : log('<-- %s (%s)', url, res.status)
        return fn(err, res)
      }
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
