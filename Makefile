.PHONY: test

test:
	if [ -f /tmp/pty-modbus-socat-lock ]; then kill -TERM `cat /tmp/pty-modbus-socat-lock`; fi
	socat -L /tmp/pty-modbus-socat-lock -d -d pty,raw,echo=0,link=/tmp/pty-modbus-server pty,raw,echo=0,link=/tmp/pty-modbus-client &
	sleep 3 && node modbus-mock-server/modbus-mock-server.js &
	node_modules/mocha/bin/mocha.js tests.js
	kill -TERM `cat /tmp/pty-modbus-socat-lock`
	sleep 1
	-stty sane
