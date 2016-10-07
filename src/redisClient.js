import P from 'bluebird'
import RedisUnpromise from 'redis'

const Redis = P.promisifyAll(RedisUnpromise)

let _client = null

const internals = { }

internals.connect = (redisUrl) => _client = Redis.createClient(redisUrl) 

internals.disconnect = () => _client.end()

internals.cacheSet = (key, value, ttl) =>  {
  const args = ttl ? [key, value, 'EX', ttl] : [key, value]
  return _client.setAsync(args)
}

internals.cacheGet = (key) =>  P.coroutine(function* () {
  const redisType = yield _client.typeAsync(key)
  if(redisType === 'set') return _client.smembersAsync(key)
  return _client.getAsync(key)
})()

internals.cacheDelete = (key) => {
  return _client.delAsync(key)
}

export default internals