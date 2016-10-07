'use strict';

var Promise = require('bluebird');
var RedisClient = require('./redisClient');
var uuid = require('uuid');

var funcSignature = {};

function connectRedis(url) {
  RedisClient.connect(url);
}

function getFunctionId(name, ttl) {
  ttl = ttl || 5000;
  if (funcSignature[name]) return funcSignature[name];
  var id = uuid.v4();
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
  ttl = ttl || 5000;
  if (!cacheKeyResolver) cacheKeyResolver = defaultCacheResolver;
  if (!func.name || func.name.trim() === '') {
    throw new Error('Cannot memoize anonymous function');
  }
  var newFunc = Promise.coroutine(regeneratorRuntime.mark(function _callee() {
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
            return RedisClient.cacheGet(cacheKey);

          case 4:
            cacheResult = _context.sent;

            if (!cacheResult) {
              _context.next = 7;
              break;
            }

            return _context.abrupt('return', JSON.parse(cacheResult));

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
            return RedisClient.cacheSet(cacheKey, JSON.stringify(result), ttl);

          case 14:
            return _context.abrupt('return', result);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return newFunc;
}

module.exports = {
  connectRedis: connectRedis, getFunctionId: getFunctionId, memoize: memoize
};