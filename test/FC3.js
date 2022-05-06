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

describe('FC3 Holding Registers', function() {

  it('works with modbus.test.holding.uint16.min', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.holding.uint16.min",
//    true // Set this true to see debug output
    )
  })

  it('works with modbus.test.holding.uint16.max', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 65535, done) },
      "modbus.test.holding.uint16.max"
    )
  })

  it('works with modbus.test.holding.int16.min', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, -32767, done) },
      "modbus.test.holding.int16.min"
    )
  })

  it('works with modbus.test.holding.int16.max', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 32767, done) },
      "modbus.test.holding.int16.max"
    )
  })
})
