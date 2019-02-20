'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fileUrl from 'file-url';
import * as fs from 'fs';

suite("Wsdl2rest Extension Tests from wsdl file", async function () {

	let sandbox: sinon.SinonSandbox;
	let showOpenDialogStub: sinon.SinonStub;
	let showQuickPickStub: sinon.SinonStub;
	let showInputBoxStub: sinon.SinonStub;

	setup(() => {
		sandbox = sinon.createSandbox();
		let addressWsdlPath = path.join(__dirname, '../../src/test/address.wsdl');
		console.log("addressWsdlPath = "+ addressWsdlPath);
		let addressWsdlUri = fileUrl(addressWsdlPath);
		console.log("addressWsdlUri = "+ addressWsdlUri);

		showOpenDialogStub = sandbox.stub(vscode.window, 'showOpenDialog');
		showOpenDialogStub.onFirstCall().resolves([vscode.Uri.file(addressWsdlPath)]);

		showQuickPickStub = sandbox.stub(vscode.window, 'showQuickPick');
		showQuickPickStub.onFirstCall().returns('Spring');

		showInputBoxStub = sandbox.stub(vscode.window, 'showInputBox');
		showInputBoxStub.onFirstCall().returns('src/main/java');
		showInputBoxStub.onSecondCall().returns('http://localhost:8080/somepath');
		showInputBoxStub.onThirdCall().returns('http://localhost:8081/jaxrs');
	});	

	teardown(() => {
		showOpenDialogStub.restore();
		showQuickPickStub.restore();
		showInputBoxStub.restore();

		sandbox.reset();
	});

	test("should be able to run command: extension.wsdl2rest - with local wsdl file", async function(done) {

		// wsdl2rest - with local wsdl file, create artifacts.

		// properties to use
		// wsdl url - somehow get file URL for the 'address.wsdl' in the test folder (see addressWsdlUri)
		// dsl - 'spring' or 'blueprint'
		// output directory - 'src/main/java'
		// jaxwsURL - 'http://localhost:8080/somepath'
		// jaxrsURL - 'http://localhost:8081/jaxrs'

		await vscode.commands.executeCommand('extension.wsdl2rest'); 

		assert.ok(fs.existsSync('./config/logging.properties'));
		assert.ok(fs.existsSync('./src/main/resources/META-INF/spring/camel-context.xml'));
		assert.ok(fs.existsSync('./src/main/java/org/jboss/fuse/wsdl2rest/test/doclit/AddAddress.java'));

		done();
	});	
});
