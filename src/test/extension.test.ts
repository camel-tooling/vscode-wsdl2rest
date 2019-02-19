import * as vscode from 'vscode';
import * as assert from 'assert';
//import * as sinon from 'sinon';

const extensionId = 'camel-tooling.vscode-wsdl2rest';

suite("Wsdl2rest Extension Tests", function () {

	// let sandbox: sinon.SinonSandbox;
	// let showOpenDialogStub: sinon.SinonStub;

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension(extensionId));
	});

	test('should activate', async function () {
		this.timeout(1 * 60 * 1000);
		return vscode.extensions.getExtension(extensionId).activate().then((api) => {
			assert.ok(true);
		});
	});	

	test('should register all wsdl2rest commands', function () {
		return vscode.commands.getCommands(true).then((commands) => {
			const COMMANDS = [
				'extension.wsdl2rest'
			];
			const foundWsdl2RestCommands = commands.filter((value) => {
				return COMMANDS.indexOf(value) >= 0 || value.startsWith('extension.wsdl2rest');
			});
			assert.equal(foundWsdl2RestCommands.length, COMMANDS.length, 
				'Additional commands found. May need to add to COMMANDS list in extension test.');
		});
	});

//	let discoveryPath = [ { fsPath: 'address.wsdl' } ];

	setup(() => {
//		showOpenDialogStub = sandbox.stub(vscode.window, 'showOpenDialog').resolves(discoveryPath);
	});	

	test("should be able to run command: extension.wsdl2rest - with local wsdl file", async function(done) {

		// wsdl2rest - with wsdl file, create artifacts.

		// properties to use
		// wsdl url - somehow get file URL for the 'address.wsdl' in the test folder
		// jaxwsURL - 'http://localhost:8080/somepath'
		// jaxrsURL - 'http://localhost:8081/jaxrs'
		// dsl - 'spring' or 'blueprint'
		// output directory - 'src/main/java'

		//await vscode.commands.executeCommand('extension.wsdl2rest'); 

		done();
	});	

	test("should be able to run command: extension.wsdl2rest - with web-provided wsdl file", async function(done) {

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

		done();
	});	

	teardown(() => {
//		showOpenDialogStub.restore();
	});
});

async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
