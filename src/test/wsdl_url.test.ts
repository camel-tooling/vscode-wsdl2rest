/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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