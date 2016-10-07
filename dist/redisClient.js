'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Redis = _bluebird2.default.promisifyAll(_redis2.default);

var _client = null;

var internals = {};

internals.connect = function (redisUrl) {
  return _client = Redis.createClient(redisUrl);
};

internals.disconnect = function () {
  return _client.end();
};

internals.cacheSet = function (key, value, ttl) {
  var args = ttl ? [key, value, 'EX', ttl] : [key, value];
  return _client.setAsync(args);
};

internals.cacheGet = function (key) {
  return _bluebird2.default.coroutine(regeneratorRuntime.mark(function _callee() {
    var redisType;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _client.typeAsync(key);

          case 2:
            redisType = _context.sent;

            if (!(redisType === 'set')) {
              _context.next = 5;
              break;
            }

            return _context.abrupt('return', _client.smembersAsync(key));

          case 5:
            return _context.abrupt('return', _client.getAsync(key));

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }))();
};

internals.cacheDelete = function (key) {
  return _client.delAsync(key);
};

exports.default = internals;