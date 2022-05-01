# signalk-modbus-serial-plugin

This project aims to be a SignalK server plugin for reading Modbus serial data.
It owns a lot to (well, it is almost a verbatim copy of)
[signalk-modbus-plugin](https://github.com/codekilo/signalk-modbus-plugin)
which implements similar interface for Modbus TCP devices.

The project is work-in-progress.

For obvious reasons I am using the concepts "server" (the device which produces
the data) and "client" (the device which reads the data) instead of the traditional
slave/master terms.

## Development

### Cloning the Plugin

To install the plugin into SignalK for development first clone the repository and link the npm module:

```
$ git clone
$ cd signalk-modbus-serial-plugin
$ npm link
```

Then go to the SignalK configuration directory (probably `~/.signalk`)  and link the module again:

```
$ cd .signalk
$ npm link @mplattu/signalk-modbus-serial-client
```

The plugin should now be installed and visible when the server has restarted.

### Virtual Serial Port and Modbus Mock Server Device

If you don't have a Modbus serial interface and/or Modbus server device to create data
you can use virtual serial port and mock device.

As user:

```
$ socat -d -d pty,raw,echo=0,link=/tmp/pty-modbus-server pty,raw,echo=0,link=/tmp/pty-modbus-client
2022/04/29 07:59:19 socat[24636] N PTY is /dev/pts/1
2022/04/29 07:59:19 socat[24636] N PTY is /dev/pts/2
2022/04/29 07:59:19 socat[24636] N starting data transfer loop with FDs [5,5] and [7,7]
```

Now you have two devices (`/dev/pts/1` and `/dev/pts/2`) and permanent symlinks
(`/tmp/pty-modbus-server` and `/tmp/pty-modbus-client`) which are connected to each
other.

```
$ cd modbus-mock-server/
$ node modbus-mock-server.js
```

Now you have a mock server listening to `/tmp/pty-modbus-client` (115200 bps) which serves data.
