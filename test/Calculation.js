const assert = require('assert')

const {createAppWithPlugin} = require ('./testutil')

const assertEqual = (valueObserved, valueExpected, done) => {
  try {
    assert.equal(valueObserved, valueExpected)
    done()
  }
  catch (err) {
    done(err)
  }
}

describe('jexl calculations', function() {

  it('works with addition 1', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.calculation.0",
//    true // Set this true to see debug output
    )
  })

  it('works with addition 2', done => {
    return createAppWithPlugin(
      (value) => { assertEqual(value, -32766, done) },
      "modbus.test.calculation.1"
    )
  })

  it('works with complex calculation', done => {
    return createAppWithPlugin(
      (value) => { assertEqual(value, -49149, done) },
      "modbus.test.calculation.2"
    )
  })

  it('works with division and decimal results', done => {
    return createAppWithPlugin(
      (value) => { assertEqual(value, 655.34, done) },
      "modbus.test.calculation.3"
    )
  })
})
