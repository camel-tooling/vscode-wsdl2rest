'use strict';

import * as child_process from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as requirements from './requirements';
import * as utils from './utils';
import { TextDecoder } from 'util';
import * as vscode from 'vscode';

const fileUrl = require('file-url');

let outputChannel: vscode.OutputChannel;
let wsdl2restProcess: child_process.ChildProcess;
let javaExecutablePath: string;
let wsdl2restExecutablePath: string;
let wsdlFileUri: string;
let outputDirectory: string;
let dsl: string;
let jaxrs: string;
let jaxws: string;


export function activate(context: vscode.ExtensionContext) {
	
	wsdl2restExecutablePath = context.asAbsolutePath(path.join('./', 'jars/','wsdl2rest.jar'));
	outputChannel = vscode.window.createOutputChannel("WSDL2Rest");

	context.subscriptions.push(vscode.commands.registerCommand('extension.wsdl2rest', () => {
		askForUserInputs()
			.then( () => {
				callWsdl2Rest(wsdl2restExecutablePath)
					.then( success => {
						if (!success) {
							vscode.window.showErrorMessage("Unable to create the WSDL2Rest files.");
						}
					})
					.catch(err => {
						console.error("WSDL2Rest execution return code: " + err);
					});
			})
			.catch(err => {
				console.error("Error retrieving the required user inputs. " + err);
			});
	}));
}

function askForUserInputs(): Promise<any> {
	return new Promise( async (resolve, reject) => {
		try {
			let fileUri = await vscode.window.showOpenDialog(utils.Options);
			if (fileUri && Array.isArray(fileUri)) {
				wsdlFileUri = fileUri[0] + "";
			} else {
				reject("WSDL not valid.");
			}
			utils.printDebug("WSDL File URI: " + wsdlFileUri);

			dsl = await vscode.window.showQuickPick(
				[
					utils.DslType.Spring, 
					utils.DslType.Blueprint
				],
				{
					placeHolder: 'Specify which DSL to generate the Camel configuration for'
				}
			);
			if (!dsl) {
				reject("No valid DSL Type selected.");
			}
			utils.printDebug("DSL Type: " + dsl);

			outputDirectory = await vscode.window.showInputBox({
				prompt: 'Output Directory',
				placeHolder: 'Enter the output directory for generated artifacts',
				value: 'src/main/java'
			});
			if (!outputDirectory) {
				reject("No valid output folder specified.");
			}
			utils.printDebug("Ouput Folder: " + outputDirectory);

			jaxws = await vscode.window.showInputBox({
				prompt: 'JAXWS Endpoint',
				placeHolder: 'Enter the address for the running jaxws endpoint',
				value: 'http://localhost:8080/somepath'
			});
			if (!jaxws) {
				reject("No valid JAXWS Endpoint soecified.");
			}
			utils.printDebug("JAXWS Endpoint: " + jaxws);

			jaxrs = await vscode.window.showInputBox({
				prompt: 'JAXRS Endpoint',
				placeHolder: 'Enter the address for the jaxrs endpoint',
				value: 'http://localhost:8081/jaxrs'
			});
			if (!jaxrs) {
				reject("No valid JAXRS endpoint specified.");
			}
			utils.printDebug("JAXRS Endpoint: " + jaxrs);
			resolve();
		} catch (error) {
			console.error(error);
			reject(error);
		}
	});
}

function callWsdl2Rest(wsdl2restExecutablePath: string): Promise<boolean> {
	return new Promise( (resolve, reject) => {
		let storagePath: string = vscode.workspace.rootPath;  // is undefined for some unknown reason

		if (outputDirectory.endsWith('/java')) {
			outputDirectory = outputDirectory.substring(0, outputDirectory.indexOf('/java'));
		}

		let outPath: string = path.join(storagePath, outputDirectory);
		
		if (!wsdlFileUri.startsWith('file:')) {
			wsdlFileUri = fileUrl(wsdlFileUri);
		}
		
		if (!fs.existsSync(outPath)) {
			vscode.window.showInformationMessage(`Creating WSDL2Rest Java output directory: ` + outPath);
			fs.ensureDirSync(outPath);
		}
		
		var restContextPath;
		var rawContextPath: any;

		const isBlueprint: boolean = dsl === utils.DslType.Blueprint;
		const isSpringBoot: boolean = dsl === utils.DslType.SpringBoot;
		const isSpring: boolean = dsl === utils.DslType.Spring;

		if (isBlueprint) {
			rawContextPath = 'src/main/resources/OSGI-INF/blueprint/blueprint.xml';
		} else if (isSpringBoot) {
			rawContextPath = 'src/main/resources/camel-context.xml';
		} else if (isSpring) {
			rawContextPath = 'src/main/resources/META-INF/spring/camel-context.xml';
		}
		restContextPath = path.join(storagePath, rawContextPath);

		if (outputChannel) {
			outputChannel.clear();
			outputChannel.show();
		}

		requirements.resolveRequirements()
			.then(requirements => {
				let log4jConfigPath: string = fileUrl(wsdl2restExecutablePath.substring(0, wsdl2restExecutablePath.lastIndexOf(path.sep)+1) + "log4j.properties");
				utils.printDebug("Log4J Config: " + log4jConfigPath);
				javaExecutablePath = path.resolve(requirements.java_home + '/bin/java');
				utils.printDebug("Java Binary: " + javaExecutablePath);
				utils.printDebug("WSDL2Rest JAR: " + wsdl2restExecutablePath);
				utils.printDebug("Java Call: " + javaExecutablePath + " " + log4jConfigPath + " -jar " + wsdl2restExecutablePath);
				outputChannel.append("Executing WSDL2Rest...\n");
				wsdl2restProcess = child_process.spawn(javaExecutablePath, [
					"-Dlog4j.configuration=" + log4jConfigPath, 
					"-jar", 
					wsdl2restExecutablePath, 
					"--wsdl",
					wsdlFileUri,
					"--out",
					outPath,
					isBlueprint ? "--blueprint-context" : "--camel-context",
					restContextPath,
					jaxrs ? "--jaxrs" : "", 
					jaxrs ? jaxrs : "",
					jaxws ? "--jaxws" : "", 
					jaxws ? jaxws : ""
				]);

				wsdl2restProcess.stdout.on('data', function (data) {
					outputChannel.append(`${data} \n`);
					utils.printDebug(data);
				});
				wsdl2restProcess.stderr.on('data', function (data) {
					outputChannel.append(`${data} \n`);
					utils.printDebug(data);
				});
				wsdl2restProcess.on("close", (code, signal) => {
					if (code === 0) {
						vscode.window.showInformationMessage('Created CXF artifacts for specified WSDL at ' + outputDirectory);
						vscode.window.showInformationMessage('Created ' + rawContextPath);
					} else {
						vscode.window.showErrorMessage(`Wsdl2Rest did not generate artifacts successfully - please check the output channel for details`);
					}
					outputChannel.append("\nProcess finished. Return code " + code + ".\n\n");
					resolve(code === 0);
				});				
			});
	});
}
