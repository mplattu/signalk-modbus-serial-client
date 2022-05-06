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

describe('FC4 Input Registers', function() {

  it('works with modbus.test.input.uint16.minPlusOne', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.input.uint16.minPlusOne",
//    true // Set this true to see debug output
    )
  })

  it('works with modbus.test.input.uint16.maxMinusOne', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 65534, done) },
      "modbus.test.input.uint16.maxMinusOne"
    )
  })

  it('works with modbus.test.input.int16.minPlusOne', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, -32766, done) },
      "modbus.test.input.int16.minPlusOne"
    )
  })

  it('works with modbus.test.holding.int16.max', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 32766, done) },
      "modbus.test.input.int16.maxMinusOne"
    )
  })
})
