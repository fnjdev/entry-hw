'use strict';
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');

var copyRecursiveSync = function(src, dest) {
	var exists = fs.existsSync(src);
	var stats = exists && fs.statSync(src);
	var isDirectory = exists && stats.isDirectory();
	if (exists && isDirectory) {
		if(!fs.existsSync(dest)) {
			fs.mkdirSync(dest);
		}
		fs.readdirSync(src).forEach(function(childItemName) {
			copyRecursiveSync(path.join(src, childItemName),
			            path.join(dest, childItemName));
		});
	} else {
		var data = fs.readFileSync(src);
		fs.writeFileSync(dest, data);
	}
};

var Module = {
	flash : function(firmware, port, baudRate, callBack) {
		var appPath = '';
		if(NODE_ENV === 'production') {
			var asarPath = path.join('.', 'resources', 'app.asar', 'custom_modules', 'flasher');
			copyRecursiveSync(asarPath, path.join('.', 'resources', 'flasher'));
			appPath = 'resources';
		} else {
			appPath = path.join('app', 'custom_modules');
		}

		var rate = baudRate || '115200';
		var cmd = 'avr.exe -p m328p -P\\\\.\\' +
			port +
			' -b' + rate + ' -Uflash:w:\"' +
			firmware +
			'.hex\":i -C./avrdude.conf -carduino -D';
		
		exec(
			cmd,
			{
				cwd: path.join('.', appPath, 'flasher')
			},
			callBack
		);		
	}
};

module.exports = Module;