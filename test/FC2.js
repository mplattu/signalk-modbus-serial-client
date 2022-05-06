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

describe('FC2 Discrete Inputs', function() {

  it('works with modbus.test.discreteInput.0', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.discreteInput.0",
//    true // Set this true to see debug output
    )
  })

  it('works with modbus.test.discreteInput.1', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.discreteInput.1"
    )
  })

  it('works with modbus.test.discreteInput.2', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.discreteInput.2"
    )
  })

  it('works with modbus.test.discreteInput.3', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.discreteInput.3"
    )
  })

  it('works with modbus.test.discreteInput.4', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.discreteInput.4"
    )
  })

  it('works with modbus.test.discreteInput.5', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.discreteInput.5"
    )
  })

  it('works with modbus.test.discreteInput.6', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 0, done) },
      "modbus.test.discreteInput.6"
    )
  })

  it('works with modbus.test.discreteInput.7', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.discreteInput.7"
    )
  })
})
