'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectRedis = connectRedis;
exports.getFunctionId = getFunctionId;
exports.memoize = memoize;

var _redisClient = require('./redisClient');

var _redisClient2 = _interopRequireDefault(_redisClient);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var funcSignature = {};

function connectRedis(url) {
  _redisClient2.default.connect(url);
}

function getFunctionId(name, ttl) {
  ttl = ttl || 5000;
  if (funcSignature[name]) return funcSignature[name];
  var id = _uuid2.default.v4();
  funcSignature[name] = id;
  setTimeout(function () {
    return delete funcSignature[name];
  }, ttl);
  return id;
}

function defaultCacheResolver() {
  return JSON.stringify(arguments);
}

function memoize(func, ttl, cacheKeyResolver) {
  if (!cacheKeyResolver) cacheKeyResolver = defaultCacheResolver;
  if (!func.name || func.name.trim() === '') {
    throw new Error('Cannot memoize anonymous function');
  }
  var newFunc = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      var funcId,
          cacheKey,
          cacheResult,
          result,
          _args = arguments;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              funcId = getFunctionId(func.name, ttl);
              cacheKey = funcId + cacheKeyResolver(_args);
              _context.next = 4;
              return _redisClient2.default.cacheGet(cacheKey);

            case 4:
              cacheResult = _context.sent;

              if (!cacheResult) {
                _context.next = 7;
                break;
              }

              return _context.abrupt('return', cacheResult);

            case 7:
              result = func.apply(null, _args);

              if (!result.then) {
                _context.next = 12;
                break;
              }

              _context.next = 11;
              return result;

            case 11:
              result = _context.sent;

            case 12:
              _context.next = 14;
              return _redisClient2.default.cacheSet(cacheKey, result, 100);

            case 14:
              return _context.abrupt('return', result);

            case 15:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function newFunc() {
      return _ref.apply(this, arguments);
    };
  }();
  return newFunc;
}

module.exports = {
  connectRedis: connectRedis, getFunctionId: getFunctionId, memoize: memoize
};