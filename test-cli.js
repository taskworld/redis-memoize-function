const m = require('./index')

function get5 () {
  return 5
}
console.log(m)
m.connectRedis('redis://127.0.0.1:6379')
const func = m.memoize(get5, 100)
func().then(r => console.log(r)).done()