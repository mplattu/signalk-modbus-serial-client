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

describe('Handle errors', function() {

  it('re-trying to read value even the server is down', done => {
    const app = createAppWithPlugin(
      (value) => { assertEqual(value, 1, done) },
      "modbus.test.errors.testValue",
      //true // Set this true to see debug output
    )
  }).timeout(10000)

})
