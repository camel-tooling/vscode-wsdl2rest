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

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as webServer from '../test/app_soap';
import {
	Command,
	getPackageData,
	PackageData,
	projectPath
} from './package_data';
import {
	CommandPalette,
	DefaultWait,
	Dialog,
	Input,
	LogAnalyzer,
	Maven,
	OutputViewExt
} from 'vscode-uitests-tooling';
import { expect } from 'chai';
import {
	InputBox,
	NotificationsCenter,
	NotificationType,
	VSBrowser,
	WebDriver,
	Workbench
} from 'vscode-extension-tester';

type Runtime = 'spring' | 'blueprint';
type GenerationType = 'url' | 'file';

const mavenGoals = {
	spring: 'camel:run',
	blueprint: 'camel:run'
};

export interface TestArguments {
	camelMavenPluginVersion?: string;
	camelVersion: string;
	framework: Runtime;
	type: GenerationType;
}

interface RuntimeOutput {
	/**
	 * total Camel routes
	 */
	totalRoutes: string;
	/**
	 * started Camel routes
	 */
	startedRoutes: string;

	/**
	 * Camel version
	 */
	camelVersion: string;
}

const RUNTIME_FOLDER = path.join(projectPath, 'src', 'ui-test', 'runtimes');
const WSDL_FILE = path.join(projectPath, 'src', 'test', 'address.wsdl');
const WSDL_URL = webServer.getWSDLURL();

// temp directory for testing
export const WORKSPACE_PATH = path.join(projectPath, '.ui-testing');

export function test(args: TestArguments) {
	// set of expected files from wsdl2rest process
	const expectedFiles = new Set(getExpectedFileList(args).map(f => path.join(WORKSPACE_PATH, f)));

	describe(`Extension test[${detailsString(args)}]`, function () {
		let browser: VSBrowser;
		let driver: WebDriver;
		let packageData: PackageData = getPackageData();

		if (args.camelMavenPluginVersion == null) {
			args.camelMavenPluginVersion = args.camelVersion;
		}

		before('Project setup', async function () {
			this.timeout(8000)
			browser = VSBrowser.instance;
			driver = browser.driver;

			// copy runtime project to temp testing folder, so we can start test scenario
			fsExtra.copySync(path.join(RUNTIME_FOLDER, args.framework), WORKSPACE_PATH);

			// ensure expected files do not exist yet
			Array.from(expectedFiles).forEach(file => {
				expect(fs.existsSync(file), `File ${file} should not exist`).to.be.false;
			});
		});

		after('Project cleanup', async function () {
			// remove all files from temp directory
			for (const f of fs.readdirSync(WORKSPACE_PATH)) {
				fsExtra.removeSync(path.join(WORKSPACE_PATH, f));
			}
		});

		const command: Command = findCommand(args, packageData);

		it(`Execute command: ${command.command}`, async function () {
			this.timeout(6000);
			const cmd = await CommandPalette.open();
			await cmd.executeCommand(command.title);
		});

		it(`Open wsdl file [${args.type}]`, async function () {
			this.timeout(20000);
			switch (args.type) {
				case 'url':
					const input = await getInput();
					input.test({
						placeholder: 'Provide the URL for the WSDL file',
						message: 'WSDL URL (Press \'Enter\' to confirm or \'Escape\' to cancel)'
					});

					await input.setText(WSDL_URL);
					await input.confirm();
					break;
				case 'file':
					await Dialog.confirm(WSDL_FILE);
					break;
				default:
					expect.fail('Unsupported option');
					return null;
			}
		});

		it(`Select '${args.framework}' option`, async function () {
			const input = await getInput();

			await input.test({
				placeholder: 'Specify which DSL to generate the Camel configuration for',
				quickPicks: ['Spring', 'Blueprint']
			});

			await input.setText(args.framework);
			await input.confirm();
		});

		it(`Confirm output directory`, async function () {
			const input = await getInput();

			await input.test({
				placeholder: 'Enter the output directory for generated artifacts',
				message: 'Output Directory (Press \'Enter\' to confirm or \'Escape\' to cancel)',
				text: 'src/main/java'
			});

			await input.confirm();
		});

		it('Confirm JAX-WS endpoint', async function () {
			const input = await getInput();

			await input.test({
				placeholder: 'Enter the address for the running jaxws endpoint (defaults to http://localhost:8080/somepath)',
				message: 'JAXWS Endpoint (Press \'Enter\' to confirm or \'Escape\' to cancel)'
			});

			await input.confirm();
		});

		it('Confirm JAX-RS endpoint', async function () {
			const input = await getInput();

			await input.test({
				placeholder: 'Enter the address for the jaxrs endpoint (defaults to http://localhost:8081/jaxrs)',
				message: 'JAXRS Endpoint (Press \'Enter\' to confirm or \'Escape\' to cancel)'
			});

			await input.setText('http://localhost:8000/jaxrs');
			await input.confirm();
		});

		it('Convert wsdl project', async function () {
			this.timeout(15000);
			const resultRegex = /Process finished\. Return code (?<code>\d+)\./;

			const output = await OutputViewExt.open();

			while (!(await output.getChannelNames()).includes('WSDL2Rest'))
				/* spin lock - wait for channel to appear */;

			await output.selectChannel('WSDL2Rest');

			let text: string | null = null;
			let result: RegExpMatchArray | null = null;
			do {
				// ignore not clickable error
				text = await output.getText().catch(e => null);

				if (text === null) {
					continue;
				}

				result = text.match(resultRegex);
			} while (text === null || !result);

			await output.clearText();
			expect(result.groups['code'], 'Output did not finish with code 0').to.equal('0');
		});

		describe('Generated all files', function () {
			let notificationCenter: NotificationsCenter;

			before('Open notification center', async function() {
				notificationCenter = await new Workbench().openNotificationsCenter();
			});

			after('Close notification center', async function () {
				await notificationCenter.close();
			});

			it('Show notifications', async function () {
				this.retries(10);
		
				const notifications = await notificationCenter.getNotifications(NotificationType.Any);
				const errors: string[] = [];

				let notification = notifications.find(async n => await n.getMessage().catch(e => null) === `Created ${getCamelContextPath(args)}`);

				if (notification === undefined) {
					errors.push('Did not find camel context notification');
				}

				notification = notifications.find(async n => await n.getMessage().catch(e => null) === 'Created CXF artifacts for specified WSDL at src/main');

				if (notification === undefined) {
					errors.push('Did not find cxf notification');
				}

				notifications.forEach(async n => {
					const message = await n.getMessage().catch(e => null);
					if (message !== null) {
						console.log(`[DEBUG]: Notification message: ${message}`);
					}
				});

				if (errors.length > 0) {
					await DefaultWait.sleep(250);
					expect.fail(errors.join("\n"));
				}
			});

			for (const file of Array.from(expectedFiles)) {
				it(`Generated ${file}`, async function () {
					expect(fs.existsSync(file), `File ${file} does not exist`).to.be.true;
				});
			}
		});

		describe('Test generated project', function () {
			let maven: Maven = null;

			after('Make sure maven is not running', async function () {
				if (maven?.isRunning) {
					await maven.exit();
				}
			});

			it('Installs project', async function () {
				this.timeout(0);
				const exitCode = await prepareMavenProject(args);
				expect(exitCode).to.equal(0);
			});

			it('Run projects', async function () {
				// camel-maven-plugin must be downloaded
				this.timeout(150000);
				maven = executeProject(args);
				const data = await analyzeProject(maven);
				const expectedRoutesCount = getExpectedNumberOfRoutes(args);

				expect(parseInt(data.startedRoutes), "All routes were not started").to.equal(expectedRoutesCount);
				expect(parseInt(data.totalRoutes), "Number of routes does not match").to.equal(expectedRoutesCount);
				expect(data.camelVersion, "Camel version mismatch").to.equal(args.camelVersion);
			});
		});

	});
}

function findCommand(args: TestArguments, packageData: PackageData): Command {
	switch (args.type) {
		case 'url':
			return packageData.contributes.commands.find(x => x.command.endsWith('url'));
		case 'file':
			return packageData.contributes.commands.find(x => x.command.endsWith('local'));
		default:
			expect.fail('Unsupported option');
			return null;
	}
}

function detailsString(args: TestArguments): string {
	let segments: string[] = [];

	switch (args.type) {
		case 'url':
			segments.push(`url = ${WSDL_URL}`);
			break;
		case 'file':
			segments.push(`file = ${WSDL_FILE}`);
			break;
		default:
			expect.fail('Unsupported option');
			return null;
	}
	segments.push(args.framework);
	segments.push(`camel = ${args.camelVersion}`);
	return segments.join(', ');
}

async function prepareMavenProject(args: TestArguments): Promise<number> {
	const maven = new Maven({
		args: ['clean', 'install'],
		properties: {
			'camel.version': args.camelVersion,
			'camel.maven.plugin.version': args.camelMavenPluginVersion
		},
		cwd: WORKSPACE_PATH
	});
	maven.spawn();

	// show progress of install
	maven.stdoutLineReader.on('line', console.log);

	return maven.wait();
}

function executeProject(args: TestArguments): Maven {
	const maven = new Maven({
		args: [mavenGoals[args.framework]],
		properties: {
			'camel.version': args.camelVersion,
			'camel.maven.plugin.version': args.camelMavenPluginVersion
		},
		cwd: WORKSPACE_PATH,
		timeout: 150000
	});
	maven.spawn();
	maven.stdoutLineReader.on('line', console.log);
	return maven;
}

async function analyzeProject(maven: Maven): Promise<RuntimeOutput> {
	const analyzer = new LogAnalyzer(maven.stdoutLineReader);

	analyzer.whenMatchesThenCaptureData(/.*Total (?<totalRoutes>\d+) routes, of which (?<startedRoutes>\d+) are started/);
	analyzer.whenMatchesThenCaptureData(
		/.*Apache Camel (?<camelVersion>\d+\.\d+\.\d+(|\.[a-zA-Z0-9-_]+)) \(CamelContext: .+\) started in.*/
	);
	analyzer.startOrderedParsing();

	const analyzerResult = await analyzer.wait() as RuntimeOutput;
	return analyzerResult;
}

function getExpectedNumberOfRoutes(args: TestArguments): number {
	switch (args.type) {
		case 'file':
			return 10;
		case 'url':
			return 2;
		default:
			expect.fail('Unsupported option');
			return -1;
	}
}

function getCamelContextPath(args: TestArguments): string {
	switch (args.framework) {
		case 'spring':
			return 'src/main/resources/META-INF/spring/camel-context.xml';
		case 'blueprint':
			return 'src/main/resources/OSGI-INF/blueprint/blueprint.xml';
		default:
			expect.fail('Unsupported option');
			return null;
	}
}

function getExpectedFileList(args: TestArguments): string[] {
	let files = [
		'wsdl2rest.readme.md',
		'config/logging.properties',
		getCamelContextPath(args)
	];

	let sourceRoot: string;
	switch (args.type) {
		case 'file':
			sourceRoot = '/src/main/java/org/jboss/fuse/wsdl2rest/test/doclit';
			files.push(
				`${sourceRoot}/AddAddress.java`,
				`${sourceRoot}/AddAddressResponse.java`,
				`${sourceRoot}/Address.java`,
				`${sourceRoot}/AddressService.java`,
				`${sourceRoot}/DelAddress.java`,
				`${sourceRoot}/DelAddressResponse.java`,
				`${sourceRoot}/GetAddress.java`,
				`${sourceRoot}/GetAddressResponse.java`,
				`${sourceRoot}/Item.java`,
				`${sourceRoot}/ListAddresses.java`,
				`${sourceRoot}/ListAddressesResponse.java`,
				`${sourceRoot}/ObjectFactory.java`,
				`${sourceRoot}/package-info.java`,
				`${sourceRoot}/UpdAddress.java`,
				`${sourceRoot}/UpdAddressResponse.java`,
			);
			break;
		case 'url':
			sourceRoot = 'src/main/java/org/helloworld/test/rpclit';
			files.push(
				`${sourceRoot}/HelloPortType.java`,
				`${sourceRoot}/HelloService.java`,
			);
			break;
		default:
			expect.fail('Unsupported option');
			return null;
	}
	return files;
}

async function getInput(): Promise<Input> {
	await InputBox.create();
	return Input.getInstance();
} 
