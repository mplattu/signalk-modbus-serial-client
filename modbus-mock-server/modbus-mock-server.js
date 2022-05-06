const SERIAL_PORT = '/tmp/pty-modbus-server';
const SERIAL_SPEED = 115200;

const modbus = require('jsmodbus')
const SerialPort = require('serialport')
const serialPort = new SerialPort(SERIAL_PORT, {
  baudRate: SERIAL_SPEED,
  Parity: 'none',
  stopBits: 1,
  dataBits: 8
})

// set Slave PLC ID
const server = new modbus.server.RTU(serialPort, 1)

// FC1: Read Coil

server.coils.writeUInt16LE(1 | 4 | 16 | 64, 0)

// FC2: Read Discrete Input

server.discrete.writeUInt16LE(2 | 8 | 32 | 128, 0)

// FC3: Read Holding Register

server.holding.writeUInt16BE(0, 0)
server.holding.writeUInt16BE(65535, 2)
server.holding.writeInt16BE(-32767, 4)
server.holding.writeInt16BE(32767, 6)

// FC4: Read Input Registers

server.input.writeUInt16BE(1, 0)
server.input.writeUInt16BE(65534, 2)
server.input.writeInt16BE(-32766, 4)
server.input.writeInt16BE(32766, 6)
