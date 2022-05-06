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

describe('FC1 Coil', function() {

  it('works with modbus.test.coil.0', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.coil.0",
//    true // Set this true to see debug output
    )
  })

  it('works with modbus.test.coil.1', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.coil.1"
    )
  })

  it('works with modbus.test.coil.2', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.coil.2"
    )
  })

  it('works with modbus.test.coil.3', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.coil.3"
    )
  })

  it('works with modbus.test.coil.4', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.coil.4"
    )
  })

  it('works with modbus.test.coil.5', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.coil.5"
    )
  })

  it('works with modbus.test.coil.6', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.coil.6"
    )
  })

  it('works with modbus.test.coil.7', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.coil.7"
    )
  })
})
