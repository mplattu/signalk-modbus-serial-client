const PLUGIN_ID = 'signalk-modbus-serial-client';
const PLUGIN_NAME = 'SignalK Modbus RTU/Serial client';
module.exports = function(app) {
  var plugin = {};
  const Modbus = require("jsmodbus");
  var  socket = undefined;
  var clients = [];
  const jexl = require("jexl");
  var timers = [];

  plugin.id = PLUGIN_ID;
  plugin.name = PLUGIN_NAME;
  plugin.description = 'Plugin to import data via Modbus RTU/serial';


  function getValueDataType(fcCode, configuredDataType) {
    if (fcCode == 1 || fcCode == 2) {
      return 'uint8'
    }

    const configuredDataTypeStr = String(configuredDataType)
    if (configuredDataTypeStr == 'uint16' || configuredDataTypeStr == 'int16') {
      return configuredDataTypeStr
    }

    app.debug(`Could not detect data type (fcCode: ${fcCode}, configured data type: ${configuredDataTypeStr}) - check your configuration`)
    app.setPluginError(`Could not detect data type (fcCode: ${fcCode}, configured data type: ${configuredDataTypeStr}) - check your configuration`)

    return null
  }

  function getValueFromDataBuffer(buffer, dataType) {
    switch (String(dataType)) {
      case 'uint8':
        return buffer.readUInt8(0)
        break
      case 'uint16':
        return buffer.readUInt16BE(0)
        break
      case 'int16':
        return buffer.readInt16BE(0)
        break
    }

    app.debug(`Unknown data type ${dataType} - check your configuration`)
    app.setPluginError(`Unknown data type ${dataType} - check your configuration`)

    return null
  }

  function getCalculatedValue(rawValue, jexlExpression) {
    // context for jexl, x is the data, other constants can be added here
    var context = {
      x: rawValue
    }

    return jexlExpression.evalSync(context);
  }

  /**
   * Send a single update to SignalK.
   */
  function handleData(data, mapping, serverID, expression) {

    const dataType = getValueDataType(data.response._body._fc, mapping.dataType)
    if (dataType == null) {
      return
    }

    const buffer = data.response._body._valuesAsBuffer
    const rawValue = getValueFromDataBuffer(buffer, dataType)

    const calculatedValue = getCalculatedValue(rawValue, expression)

    // denormalized SignalK delta for a single value
    var delta = {
      values: [{
        path: mapping.path,
        value: calculatedValue
      }],
      context: app.getSelfPath('uuid'),
      $source: "modbus-serial." + serverID + "." + mapping.register + "." + mapping.operation,
      timestamp: new Date().toISOString()
    };

    var deltas = {
      updates: [delta]
    };
    app.handleMessage(PLUGIN_ID, deltas);
    app.setPluginStatus("Receiving data normally")
  }

  /**
   * Logs the error and stops the plugin
   */
  function catchError(error) {
    app.debug(error);

    if (Modbus.errors.isUserRequestError(error)) {
      app.setPluginError("Error: " + error.message + ", still trying...")
    }
    else {
      app.setPluginError("Fatal error: " + error.message + ", stopping the plugin")
      plugin.stop();
    }
  }

  function getPollModbusPromise(client, operation, register) {
    switch (String(operation)) {
      case 'fc1':
        return client.readCoils(register, 1);
        break;
      case 'fc2':
        return client.readDiscreteInputs(register, 1);
        break;
      case 'fc3':
        return client.readHoldingRegisters(register, 1);
        break;
      case 'fc4':
        return client.readInputRegisters(register, 1);
    }

    app.debug(`Unknown operation ${operation} for register ${register} - check your configuration`)
    app.setPluginError(`Unknown operation ${operation} for register ${register} - check your configuration`)

    return null
  }

  /**
   * Ask the server for the contents of a single register.
   * calls handleData to send the data to SignalK
   */
  function pollModbus(client, mapping, serverID, expression) {
    const promise = getPollModbusPromise(client, mapping.operation, mapping.register)
    if (promise != null) {
      promise.then(data => handleData(data, mapping, serverID, expression))
        .catch(catchError);
    }
  }

  /**
   * Setup the connection to a server
   * and add create all timers to poll the registers
   */
  function setupConnection(connection) {
    // connect to modbus server.

    const Serialport = require('serialport')
    socket = new Serialport(connection.connection.devicepath, {
      baudRate: connection.connection.baudrate,
      Parity: 'none',
      stopBits: 1,
      dataBits: 8
    })

    socket.on('open', function () {
      app.debug("serial connection " + connection.connection.devicepath + " is open, now creating clients")

      connection.servers.forEach(function(server) {
        const client = new Modbus.client.RTU(socket, server.serverID, connection.connection.timeout)

        server.mappings.forEach(function(mapping) {
          timers.push(
            setInterval(pollModbus, connection.pollingInterval * 1000,
              client, mapping, server.serverID, jexl.compile(mapping.conversion))
          )
        })

        clients.push(client);
      });
    });

    socket.on('error', function (err) {
      const message = "an error occured while setting up serial connection " + connection.connection.devicepath + ": " + err;

      app.debug(message);
      app.setPluginError(message);
    });

  }

  // called when the plugin is started
  plugin.start = function(options, restartPlugin) {
    app.setPluginStatus("Initializing");
    plugin.options = options;
    app.debug('Plugin started');
    options.connections.forEach(setupConnection);

    app.setPluginStatus("Running");
  };

  // called when the plugin is stopped or encounters an error
  plugin.stop = function() {
    socket.close();
    socket = undefined;
    app.debug('Plugin stopped');
    timers.forEach(timer => clearInterval(timer));

    app.setPluginStatus('Stopped');
  };

  // The plugin configuration
  plugin.schema = {
    title: PLUGIN_NAME,
    type: 'object',
    properties: {
      connections: {
        type: 'array',
        title: 'Servers:',
        items: {
          type: 'object',
          title: 'connection',
          properties: {
            pollingInterval: {
              type: 'number',
              title: "Interval (in seconds) to poll device",
              default: 20
            },
            connection: {
              type: 'object',
              title: "connection information",
              properties: {
                devicepath: {
                  type: 'string',
                  title: "device path",
                  default: "/dev/ttyUSB0"
                },
                baudrate: {
                  type: 'number',
                  title: "Connection speed (a.k.a. baudrate)",
                  default: 9600
                }
              }
            },
            servers: {
              type: 'array',
              title: "servers",
              items: {
                type: 'object',
                title: 'Server',
                properties: {
                  serverID: {
                    type: 'number',
                    title: "ServerID",
                    default: 0
                  },
                  mappings: {
                    title: 'map registers to SignalK paths',
                    type: 'array',
                    items: {
                      type: 'object',
                      title: 'Map register to SignalK path',
                      properties: {
                        operation: {
                          type: 'string',
                          title: 'operation type',
                          enum: ['fc1', 'fc2', 'fc3', 'fc4'],
                          enumNames: [
                            'read coil (FC1)',
                            'read discrete input (FC2)',
                            'read holding register (FC3)',
                            'read input register (FC4)'
                          ],
                          default: 'fc3'
                        },
                        register: {
                          type: 'number',
                          title: 'register',
                          default: 11
                        },
                        dataType: {
                          type: 'string',
                          title: 'DataType',
                          enum: ['uint16', 'int16'],
                          enumNames: [
                            '16 bit integer (unsigned, 0..65535)',
                            '16 bit integer (signed, -32767..32767)'
                          ],
                          default: 'int16'
                        },
                        path: {
                          type: 'string',
                          title: "Path to store data",
                          default: "modbus.test"
                        },
                        conversion: {
                          type: 'string',
                          title: 'conversion expression',
                          default: "x"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  // set the order for fields and make the arrays unorderable
  plugin.uiSchema = {
    connections: {
      "ui:options": {
        orderable: false
      },
      items: {
        "ui:order": ["connection", "pollingInterval", "servers"],
        servers: {
          "ui:options": {
            orderable: false
          },
          items: {
            "ui:order": ["serverID", "mappings"],
            mappings: {
              "ui:options": {
                orderable: false
              },
              items: {
                "ui:order": ["operation", "register", "dataType", "path", "conversion"]
              }
            }
          }
        }
      }
    }
  };

  return plugin;
};
