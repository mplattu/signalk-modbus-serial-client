.PHONY: test

test:
	if [ -f /tmp/pty-modbus-socat-lock ]; then kill -TERM `cat /tmp/pty-modbus-socat-lock`; fi
	socat -L /tmp/pty-modbus-socat-lock -d -d pty,raw,echo=0,link=/tmp/pty-modbus-server pty,raw,echo=0,link=/tmp/pty-modbus-client &
	node modbus-mock-server/modbus-mock-server.js &
	node_modules/mocha/bin/mocha.js
	kill -TERM `cat /tmp/pty-modbus-socat-lock`
	-stty sane
