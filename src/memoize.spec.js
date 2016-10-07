import Promise from 'bluebird'
import Sinon from 'sinon'
import { expect } from 'chai'
import * as memoizer from './memoize'

describe('memoize', () => {
  it('should return be able to memoize normal function', async () => {
    const obj = {
      testFunc () {
        return '5'
      } 
    }
    const spy = Sinon.spy(obj, 'testFunc')
    memoizer.connectRedis('redis://127.0.0.1:6379')
    const memoizeFunc = memoizer.memoize(obj.testFunc)
    const res1 = await memoizeFunc()
    expect(res1).to.equal('5')
    const res2 = await memoizeFunc()
    expect(res2).to.equal('5')
    expect(spy.callCount).to.equal(1)
  })

  it('should throw on anonymous function', () => {
    const toThrow = () => memoizer.memoize(() => { })
    expect(toThrow).to.throw()
  })

  it('should return be able to memoize promised function', async () => {
    let callCount = 0
    const obj = {
      testFuncPromise () {
        return Promise.try(() => {
          callCount++
          return '5'
        })
      } 
    }
    memoizer.connectRedis('redis://127.0.0.1:6379')
    const memoizeFunc = memoizer.memoize(obj.testFuncPromise)
    const res1 = await memoizeFunc()
    expect(res1).to.equal('5')
    const res2 = await memoizeFunc()
    expect(res2).to.equal('5')
    expect(callCount).to.equal(1)
  })

  it('should return be able to memoize parameterized function', async () => {
    let callCount = 0
    const obj = {
      testFuncPromise (a, b) {
        return Promise.try(() => {
          callCount++
          if (a === 1 && b === 2) return 'case1'
          if (a === 1 && b === 3) return 'case2'
          if (a === 2 && b === 3) return 'case3'
          return 'nocase'
        })
      } 
    }
    memoizer.connectRedis('redis://127.0.0.1:6379')
    const memoizeFunc = memoizer.memoize(obj.testFuncPromise)
    const res1 = await memoizeFunc(1, 2)
    expect(res1).to.equal('case1')
    const res2 = await memoizeFunc(1, 3)
    expect(res2).to.equal('case2')
    const res3 = await memoizeFunc(1, 3)
    expect(res3).to.equal('case2')
    const res4 = await memoizeFunc(2, 3)
    expect(res4).to.equal('case3')
    expect(callCount).to.equal(3)
  })
})

describe('getFuncId', () => {
  it('should return function signature within ttl', async () => {
    const myFunc = () => { }
    const id = memoizer.getFunctionId(myFunc, 10)
    expect(id).to.equal(memoizer.getFunctionId(myFunc))
    await Promise.delay(10)
    expect(id).to.not.equal(memoizer.getFunctionId(myFunc))
  })
})