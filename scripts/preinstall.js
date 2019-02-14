'use strict';

const fs = require('fs');
const path = require('path');

const wsdl2rest_version = '0.0.1-SNAPSHOT';

let filename = 'wsdl2rest-fatjar-' + wsdl2rest_version + '.jar';
let configFileName = "logging.properties";
let src = path.join('./wsdl2rest/target/', filename);
let configSrc = path.join('./wsdl2rest/config/', configFileName);
let destDir = path.join('./', 'jars');

fs.access(destDir, err => {
	if (err) {
		fs.mkdirSync(destDir);
	}
	copyFile(src, path.join(destDir, "wsdl2rest.jar"));
	copyFile(configSrc, path.join(destDir, "log4j.properties"));
});

function copyFile(src, dest) {
	let readStream = fs.createReadStream(src);

	readStream.once('error', err => {
		console.error(err);
	});

	readStream.once('end', () => {
		console.log(src + " copied.");
	});

	readStream.pipe(fs.createWriteStream(dest));
}
