# redis-memoizer

function memoizer by using redis cache

# Inspiration

Lodash memoizing have problem about memory leak states here:

http://stackoverflow.com/questions/38600119/is-the-default-lodash-memoize-function-a-danger-for-memory-leaks

So I write a new memoizer using redis and TTL to ensure memory not leaking

# How to use

```
npm install redis-memoize-function
```

You can memoize function by using this pattern

```
function originalFunction () {
   return 555
} 
memoizer.connectRedis('redis://127.0.0.1:6379')
const memoizeFunc = memoizer.memoize(originalFunction)
const res1 = await memoizeFunc()
assert(res1 === 555)
```

Please beware that you cannot memoize

1. Anonymous function (will throw)
2. Functions with same name

Memoize function will now become a promise-based function, because it's use redis

