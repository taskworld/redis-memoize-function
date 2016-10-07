const Promise = require('bluebird')
const RedisClient = require('./redisClient')
const uuid = require('uuid')

const funcSignature = { }

function connectRedis (url) {
  RedisClient.connect(url)
}

function getFunctionId (name, ttl) {
  ttl = ttl || 5000
  if (funcSignature[name]) return funcSignature[name]
  const id = uuid.v4()
  funcSignature[name] = id
  setTimeout(() => delete funcSignature[name], ttl)
  return id
}

function defaultCacheResolver () {
  return JSON.stringify(arguments)
}

function memoize (func, ttl, cacheKeyResolver) {
  ttl = ttl || 5000
  if (!cacheKeyResolver) cacheKeyResolver = defaultCacheResolver
  if (!func.name || func.name.trim() === '') {
    throw new Error('Cannot memoize anonymous function')
  }
  const newFunc = Promise.coroutine(function* () {
    const funcId = getFunctionId(func.name, ttl)
    const cacheKey = funcId + cacheKeyResolver(arguments)
    const cacheResult = yield RedisClient.cacheGet(cacheKey)
    if (cacheResult) return JSON.parse(cacheResult)
    let result = func.apply(null, arguments)
    if (result.then) result = yield result
    yield RedisClient.cacheSet(cacheKey, JSON.stringify(result), ttl)
    return result
  })

  return newFunc
}

module.exports = {
  connectRedis, getFunctionId, memoize
}