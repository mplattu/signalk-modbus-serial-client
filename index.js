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

  /**
   * Send a single update to SignalK.
   */
  function handleData(data, mapping, serverID, expression) {
    app.debug(data);

    var i;

    const buffer = data.response._body._valuesAsBuffer

    if (data.response._body._fc == 1 || data.response._body._fc == 2) {
      i = buffer.readUInt8(0);
    }
    else if (String(mapping.dataType) == 'uint16') {
      i = buffer.readUInt16BE(0);
    }
    else if (String(mapping.dataType) == 'int16') {
      i = buffer.readInt16BE(0);
    }
    else {
      app.debug("Don't know how to handle this mapping/data - check your configuration")
      app.debug(mapping)
      app.debug(data)
      return
    }

    // context for jexl, x is the data, other constants can be added here
    var context = {
      x: i
    };
    var value = expression.evalSync(context);
    // denormalized SignalK delta for a single value
    var delta = {
      values: [{
        path: mapping.path,
        value: value
      }],
      context: app.getSelfPath('uuid'),
      $source: "modbus-serial." + serverID + "." + mapping.register + "." + mapping.operation,
      timestamp: new Date().toISOString()
    };

    var deltas = {
      updates: [delta]
    };
    app.handleMessage(PLUGIN_ID, deltas);
  }

  /**
   * Logs the error and stops the plugin
   */
  function catchError(error) {
    app.setProviderError("an error occured: " + error.message);
    app.debug(error);
    plugin.stop();
  }

  /**
   * Ask the server for the contents of a single register.
   * calls handleData to send the data to SignalK
   */
  function pollModbus(client, mapping, serverID, expression) {
    let promise;
    const length = 1;

    switch (String(mapping.operation)) {
      case 'fc1':
        promise = client.readCoils(mapping.register, length);
        break;
      case 'fc2':
        promise = client.readDiscreteInputs(mapping.register, length);
        break;
      case 'fc3':
        promise = client.readHoldingRegisters(mapping.register, length);
        break;
      case 'fc4':
        promise = client.readInputRegisters(mapping.register, length);
    }
    promise.then(data => handleData(data, mapping, serverID, expression))
      .catch(catchError);
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
      app.setProviderError(message);
    });

  }

  // called when the plugin is started
  plugin.start = function(options, restartPlugin) {
    app.setProviderStatus("Initializing");
    plugin.options = options;
    app.debug('Plugin started');
    options.connections.forEach(setupConnection);

    app.setProviderStatus("Running");
  };

  // called when the plugin is stopped or encounters an error
  plugin.stop = function() {
    socket.close();
    socket = undefined;
    app.debug('Plugin stopped');
    timers.forEach(timer => clearInterval(timer));

    app.setProviderStatus('Stopped');
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
