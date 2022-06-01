const DEBUG_MESSAGES = true
const fs = require('fs');

module.exports = {
  createAppWithPlugin: function (onHandleMessage, handleMessagePathFilter, showDebugMessages) {
    const app = {
      setPluginStatus: (message) => {
        if (showDebugMessages) {
          console.debug('setPluginStatus: %o', message)
        }
      },
      setPluginError: (message) => {
        if (showDebugMessages) {
          console.debug('setProviderError: %o', message)
        }
      },
      debug: (message) => {
        if (showDebugMessages) {
          console.debug('debug: %o', message)
        }
      },
      getSelfPath: () => {
      },
      stop: () => {
        if (showDebugMessages) {
          console.log('now stopping plugin %o', plugin)
        }
        plugin.stop()
      },
      handleMessage: (pluginId, deltas) => {
        const path = deltas.updates[0].values[0].path
        const value = deltas.updates[0].values[0].value

        if (path == handleMessagePathFilter) {
          plugin.stop()
          onHandleMessage(value)
        }
      }
    }

    const plugin = require('../')(app)

    fs.readFile('test/signalk-modbus-serial-client-test.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err)
        return null
      } else {
        const options = JSON.parse(data)
        plugin.start(options.configuration)
        return app
      }
    })
  }
}
