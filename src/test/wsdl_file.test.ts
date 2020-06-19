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
import * as test_utils from './test_utils';
import { expect } from 'chai';
import { getStoragePath } from '../extension';

suite("Wsdl2rest Extension Tests from wsdl file - spring", async function () {

	let sandbox: sinon.SinonSandbox;
	let showOpenDialogStub: sinon.SinonStub;
	let showQuickPickStub: sinon.SinonStub;
	let showInputBoxStub: sinon.SinonStub;

	let projectroot = 'myproject';
	let srcPath = projectroot + '/src/main/java';
	let projectdir =  path.join(__dirname, projectroot);

	setup(() => {
		sandbox = sinon.createSandbox();
		let addressWsdlPath = path.join(__dirname, '../../src/test/address.wsdl');
		console.log("addressWsdlPath = "+ addressWsdlPath);

		showOpenDialogStub = sandbox.stub(vscode.window, 'showOpenDialog');
		showOpenDialogStub.onFirstCall().resolves([vscode.Uri.file(addressWsdlPath)]);

		showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');

		showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
		showInputBoxStub.onFirstCall().returns(srcPath);
		showInputBoxStub.onSecondCall().returns('http://localhost:8080/somepath');
		showInputBoxStub.onThirdCall().returns('http://localhost:8081/jaxrs');
	});	

	teardown(() => {
		showOpenDialogStub.restore();
		showQuickPickStub.restore();
		showInputBoxStub.restore();

		sandbox.reset();
	});

	test("should be able to run command: extension.wsdl2rest - with local wsdl file - spring", async function() {

		await test_utils.cleanup(projectdir);
		showQuickPickStub.onFirstCall().returns('Spring');

		await vscode.commands.executeCommand('extension.wsdl2rest.local'); 

		let storageDir = getStoragePath();
		console.log(`Project is at ${storageDir}`);

		projectdir = path.join(storageDir, 'myproject');

		const logPath = path.join(storageDir, '/config/logging.properties');
		const contextPath = path.join(projectdir, '/src/main/resources/META-INF/spring/camel-context.xml');
		const generatedClassPath = path.join(projectdir, '/src/main/java/org/jboss/fuse/wsdl2rest/test/doclit/AddAddress.java');

		assert.ok(fs.existsSync(logPath));
		assert.ok(fs.existsSync(contextPath));
		assert.ok(fs.existsSync(generatedClassPath));
	});	

	test("should be able to run command: extension.wsdl2rest - with local wsdl file - blueprint", async function() {

		await test_utils.cleanup(projectdir);
		showQuickPickStub.onFirstCall().returns('Blueprint');

		await vscode.commands.executeCommand('extension.wsdl2rest.local'); 

		let storageDir = getStoragePath();
		console.log(`Project is at ${storageDir}`);

		projectdir = path.join(storageDir, 'myproject');

		assert.ok(fs.existsSync(path.join(storageDir, './config/logging.properties')));
		assert.ok(fs.existsSync(path.join(projectdir, '/src/main/resources/OSGI-INF/blueprint/blueprint.xml')));
		assert.ok(fs.existsSync(path.join(projectdir, '/src/main/java/org/jboss/fuse/wsdl2rest/test/doclit/AddAddress.java')));
	});	
});

suite("Wsdl2rest Extension Tests from wsdl file - spring - with no jaxws or jaxrs URLs specified", async function () {

	let sandbox: sinon.SinonSandbox;
	let showOpenDialogStub: sinon.SinonStub;
	let showQuickPickStub: sinon.SinonStub;
	let showInputBoxStub: sinon.SinonStub;

	let projectroot = 'myproject';
	let srcPath = projectroot + '/src/main/java';
	let projectdir =  path.join(__dirname, projectroot);

	setup(() => {
		sandbox = sinon.createSandbox();
		let addressWsdlPath = path.join(__dirname, '../../src/test/address.wsdl');
		console.log("addressWsdlPath = "+ addressWsdlPath);

		showOpenDialogStub = sandbox.stub(vscode.window, 'showOpenDialog');
		showOpenDialogStub.onFirstCall().resolves([vscode.Uri.file(addressWsdlPath)]);

		showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');

		showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
		showInputBoxStub.onFirstCall().returns(srcPath);
		showInputBoxStub.onSecondCall().returns('');
		showInputBoxStub.onThirdCall().returns('');
	});	

	teardown(() => {
		showOpenDialogStub.restore();
		showQuickPickStub.restore();
		showInputBoxStub.restore();

		sandbox.reset();
	});

	test("should be able to run command: extension.wsdl2rest - with local wsdl file that has no jaxws or jaxrs path - spring", 
		async function() {

		// by not passing a jaxws or jaxrs value, the wsdl2rest utility uses the built-in default in the case of jaxrs
		// (the default is 'http://localhost:8081/jaxrs') or for jaxws will check the inbound wsdl to see if there is 
		// a soap:address location specified in the service/port declaration 
		// (for the address.wsdl it declares '<soap:address location="http://localhost:9090/AddressPort"/>')
		// if such a declaration is found, it will use that instead of the default 'http://localhost:8080/somepath'
		await test_utils.cleanup(projectdir);
		showQuickPickStub.onFirstCall().returns('Spring');

		await vscode.commands.executeCommand('extension.wsdl2rest.local'); 

		let storageDir = getStoragePath();
		console.log(`Project is at ${storageDir}`);

		projectdir = path.join(storageDir, 'myproject');
		
		let configPath = path.join(projectdir, '/src/main/resources/META-INF/spring/camel-context.xml');
		assert.ok(fs.existsSync(configPath));

		// check to see if the generated config uses the wsdl-specified soap address for the <to uri=...> 
		fs.readFile(configPath, 'utf8', function(err, contents) {
			expect(contents).to.contain('http://localhost:9090/AddressPort');
		});
	});	

});
