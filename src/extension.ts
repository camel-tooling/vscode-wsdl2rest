'use strict';

import * as child_process from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as requirements from './requirements';
import { TextDecoder } from 'util';
import * as vscode from 'vscode';

const fileUrl = require('file-url');
const exec = require('child_process').exec;

const options: vscode.OpenDialogOptions = {
	canSelectMany: false,
	openLabel: 'Open WSDL File',
	filters: {
		'WSDL files': ['wsdl'],
		'All files': ['*']
	}
};

export function activate(context: vscode.ExtensionContext) {
	
	let wsdl2restExecutablePath = context.asAbsolutePath(path.join('jars','wsdl2rest.jar'));

	context.subscriptions.push(vscode.commands.registerCommand('extension.wsdl2rest', () => {
		doWsdl2Rest(wsdl2restExecutablePath);
	}));
}

async function doWsdl2Rest(wsdl2restExecutablePath: string) {
	try {
		let wsdlFileUri: any = await vscode.window.showOpenDialog(options);
		if (wsdlFileUri) {
			let dslChoice = await vscode.window.showQuickPick(
				['Spring', 'Blueprint'],
				{
					placeHolder:
						'Specify which DSL to generate the Camel configuration for'
				}
			);
			if (dslChoice) {
				vscode.window.showInformationMessage(`DSL Choice: ${dslChoice}`);
				let outputDir = await vscode.window.showInputBox({
					prompt: 'Output Directory',
					placeHolder: 'Enter the output directory for generated artifacts',
					value: 'src/main/java'
				});
				if (outputDir) {
					let jaxWs = await vscode.window.showInputBox({
						prompt: 'JAXWS Endpoint',
						placeHolder: 'Enter the address for the running jaxws endpoint',
						value: 'http://localhost:8080/somepath'
					});
					if (jaxWs) {
						let jaxRs = await vscode.window.showInputBox({
							prompt: 'JAXRS Endpoint',
							placeHolder: 'Enter the address for the jaxrs endpoint',
							value: 'http://localhost:8081/jaxrs'
						});
						if (jaxRs) {
							await callWsdl2Rest(
								wsdl2restExecutablePath,
								outputDir,
								wsdlFileUri.toString(),
								dslChoice,
								jaxRs,
								jaxWs,
								true
							);
						}
					}
				}
			}
		}
	} catch (error) {
		vscode.window.showErrorMessage('Error while processing wsdl2rest: ' + error);
	}
}

async function callWsdl2Rest(
	wsdl2restExecutablePath: string,
	outputDirectory: any,
	wsdlUrl: any,
	dsl: any,
	jaxrs: any,
	jaxws: any,
	isDebug: boolean
) {
	let storagePath = vscode.workspace.rootPath;

	let actualJavaOutDirectory: string = outputDirectory;
	if (actualJavaOutDirectory.endsWith('/java')) {
		actualJavaOutDirectory = actualJavaOutDirectory.substring(0, actualJavaOutDirectory.indexOf('/java'));
	}
	let outPath: string = path.join(storagePath, actualJavaOutDirectory.toString());
	let wsdlFileUrl: string;
	if (wsdlUrl.startsWith('http')) {
		wsdlFileUrl = wsdlUrl;
	} else if (!wsdlUrl.startsWith('file:')) {
		wsdlFileUrl = fileUrl(wsdlUrl);
	} else {
		wsdlFileUrl = wsdlUrl;
	}

	if (!fs.existsSync(outPath.toString())) {
		console.log(`Creating wsdl2rest java output directory`);
		await fs.ensureDir(outPath.toString());
	}

	var restContextPath;
	var rawContextPath: any;

	const isBlueprint: boolean = dsl.match(/blueprint/i);
	const isSpringBoot: boolean = dsl.match(/spring-boot/i);
	const isSpring: boolean = dsl.match(/spring/i);

	if (isBlueprint) {
		rawContextPath = 'src/main/resources/OSGI-INF/blueprint/blueprint.xml';
	} else if (isSpringBoot) {
		rawContextPath = 'src/main/resources/camel-context.xml';
	} else if (isSpring) {
		rawContextPath = 'src/main/resources/META-INF/spring/camel-context.xml';
	}
	restContextPath = path.join(storagePath, rawContextPath);

	// build the java command with classpath, class name, and the passed parameters
	var cmdString = 
		' --wsdl ' +
		wsdlFileUrl +
		' --out ' +
		outPath;

	if (isBlueprint) {
		cmdString = cmdString + ' --blueprint-context ' + restContextPath;
	} else {
		cmdString = cmdString + ' --camel-context ' + restContextPath;
	}

	if (jaxrs) {
		cmdString = cmdString + ' --jaxrs ' + jaxrs;
	}
	if (jaxws) {
		cmdString = cmdString + ' --jaxws ' + jaxws;
	}
	vscode.window.showInformationMessage('Calling wsdl2rest');
	if (isDebug) {
		vscode.window.showInformationMessage('   command used: ' + cmdString);
	}
	return new Promise((resolve, reject) => {
		let outputChannel = vscode.window.createOutputChannel("WSDL2Rest");
		requirements.resolveRequirements()
			.then(requirements => {
				let javaExecutablePath = path.resolve(requirements.java_home + '/bin/java');
				let process = child_process.spawn(javaExecutablePath, ['-jar', wsdl2restExecutablePath, cmdString]);
				process.on("close", (code, signal) => {
					if (outputChannel) {
						try {
							outputChannel.dispose(); // maybe think about not disposing it to let people read what went wrong?
						} catch (error) {
							reject(error);
						}
					}
					if (code === 0) {
						vscode.window.showInformationMessage('Created CXF artifacts for specified WSDL at ' + outputDirectory);
						vscode.window.showInformationMessage('Created ' + rawContextPath);
						resolve();
					} else {
						vscode.window.showErrorMessage(`Wsdl2Rest did not generate artifacts successfully - please check the output channel for details`);
						reject(code);
					}
				});
				process.stdout.on('data', function (data) {
					let dec = new TextDecoder("utf-8");
					let text = dec.decode(data);
					outputChannel.append(text);
				});
			});
	});
}
