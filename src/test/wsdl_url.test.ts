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

import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from '../utils';
import * as app_soap from './app_soap';

// possible wsdl to test - http://www.thomas-bayer.com/axis2/services/BLZService?wsdl

suite("Wsdl2rest Extension Tests from URL-provided wsdl file", function () {

	let sandbox: sinon.SinonSandbox;
	let showQuickPickStub: sinon.SinonStub;
	let showInputBoxStub: sinon.SinonStub;

	let projectroot = 'myproject';
	let srcPath = projectroot + '/src/main/java';
	let projectdir =  path.join(__dirname, projectroot);

	setup(async function () {
		await app_soap.startWebService();
		console.log('Started web service on ' + app_soap.getServiceURL());

		// properties to use
		// wsdl url - 'http://localhost:3000/helloworldservice?wsdl'
		// jaxwsURL - 'http://localhost:3000/helloworldservice'
		// jaxrsURL - 'http://localhost:8081/jaxrs'
		// dsl - 'spring' or 'blueprint'
		// output directory - 'src/main/java'

		sandbox = sinon.createSandbox();

		showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');

		showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
		showInputBoxStub.onFirstCall().returns('http://localhost:3000/helloworldservice?wsdl');
		showInputBoxStub.onSecondCall().returns(srcPath);
		showInputBoxStub.onThirdCall().returns('http://localhost:3000/helloworldservice');
		showInputBoxStub.onCall(3).returns('http://localhost:8081/jaxrs');
	});

	teardown(async function () {
		await app_soap.stopWebService();
		console.log('Stopped web service on ' + app_soap.getServiceURL());

		showQuickPickStub.restore();
		showInputBoxStub.restore();

		sandbox.reset();
	});

	test('Should do something with wsdl2rest accessing a wsdl from a running web service', async function () {
		utils.deleteNoFailRecursive(projectdir);
		showQuickPickStub.onFirstCall().returns('Spring');

		await vscode.commands.executeCommand('extension.wsdl2rest.url'); 

		assert.ok(fs.existsSync(path.join(__dirname, './config/logging.properties')));
		assert.ok(fs.existsSync(path.join(projectdir, '/src/main/resources/META-INF/spring/camel-context.xml')));
		assert.ok(fs.existsSync(path.join(projectdir, '/src/main/java/org/helloworld/test/rpclit/HelloService.java')));

	});
});