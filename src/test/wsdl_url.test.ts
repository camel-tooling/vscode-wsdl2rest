'use strict';

import * as app_soap from './app_soap';

suite("Wsdl2rest Extension Tests from URL-provided wsdl file", function () {

	setup(async function () {
		await app_soap.startWebService();
		console.log('Started web service on ' + app_soap.getServiceURL());
	});

	teardown(async function () {
		await app_soap.stopWebService();
		console.log('Stopped web service on ' + app_soap.getServiceURL());
	});

	test('Should do something with wsdl2rest accessing a wsdl from a running web service', function () {
		// wsdl2rest - with wsdl address, create artifacts.
		// run web service

		// properties to use
		// wsdl url - 'http://localhost:3000/helloworldservice?wsdl'
		// jaxwsURL - 'http://localhost:3000/helloworldservice'
		// jaxrsURL - 'http://localhost:8081/jaxrs'
		// dsl - 'spring' or 'blueprint'
		// output directory - 'src/main/java'

		//await vscode.commands.executeCommand('extension.wsdl2rest'); 

		// shut down web service

		// currently, this option does not exist - we only accept a local file, not a URL

		this.skip();
	});
});