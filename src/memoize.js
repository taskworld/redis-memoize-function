import RedisClient from './redisClient'
import uuid from 'uuid'

const funcSignature = { }

export function connectRedis (url) {
  RedisClient.connect(url)
}

export function getFunctionId (name, ttl) {
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

export function memoize (func, ttl, cacheKeyResolver) {
  if (!cacheKeyResolver) cacheKeyResolver = defaultCacheResolver
  if (!func.name || func.name.trim() === '') {
    throw new Error('Cannot memoize anonymous function')
  }
  const newFunc = async function () {
    const funcId = getFunctionId(func.name, ttl)
    const cacheKey = funcId + cacheKeyResolver(arguments)
    const cacheResult = await RedisClient.cacheGet(cacheKey)
    if (cacheResult) return cacheResult
    let result = func.apply(null, arguments)
    if (result.then) result = await result
    await RedisClient.cacheSet(cacheKey, result, 100)
    return result
  }
  return newFunc
}