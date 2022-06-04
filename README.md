# signalk-modbus-serial-client

This is a SignalK server plugin for reading Modbus serial data.
It owns a lot to (well, it is almost a verbatim copy of)
[signalk-modbus-plugin](https://github.com/codekilo/signalk-modbus-plugin)
which implements similar interface for Modbus TCP devices.

For obvious reasons I am using the concepts "server" (the device which produces
the data) and "client" (the device which reads the data) instead of the traditional
slave/master terms.

## Configuration

The plugin creates a configuration editor to Server > Plugin config. The configuration
file is stored to server's `plugin-config-data/signalk-modbus-serial-client.json`.

An attached `signalk-modbus-serial-client-SOLAR.json` should work at least with
following solar chargers:
 * EPSolar/EPEver Tracer A/B-Series ([reference](https://github.com/tekk/Tracer-RS485-Modbus-Blynk-V2))
 * Sunbeam MoonRay MPPT 320 (tested)

## Development

### Installing SignalK Server

The installation process is described in the
[SignalK documentation](https://github.com/SignalK/signalk-server). You can either
make Modbus (mock) device interface available for Docker image or install the SignalK
server from git:

```
git clone https://github.com/SignalK/signalk-server.git
cd signalk-server
npm install
npm run build:all
bin/signalk-server
```

### Cloning the Plugin

To install the plugin into SignalK for development first clone the repository and link the npm module:

```
$ git clone
$ cd signalk-modbus-serial-client
$ npm link
```

Then go to the SignalK configuration directory (probably `~/.signalk`)  and link the module again:

```
$ cd .signalk
$ npm link @mplattu/signalk-modbus-serial-client
```

The plugin should now be installed and visible when the server has restarted.

### Tests

The test automation uses Mocha, virtual serial interface and Modbus mock server
(`modbus-mock-server/`). Executing `make test` should do everything automatically.
