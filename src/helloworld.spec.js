import { expect } from 'chai'
import HelloWorld from './helloworld'

describe('Helloworld', () => {
  it('should return hellow world', () => {
    expect(HelloWorld()).to.equal('Hello world')
  })
})