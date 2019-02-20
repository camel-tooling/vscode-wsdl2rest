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

import * as child_process from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as requirements from './requirements';
import * as utils from './utils';
import * as vscode from 'vscode';
import * as os from 'os';
import * as fileUrl from 'file-url';
import * as url from 'url';

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
	context.subscriptions.push(vscode.commands.registerCommand('extension.wsdl2rest.local', () => callWsdl2RestViaUIAsync(false)));
	context.subscriptions.push(vscode.commands.registerCommand('extension.wsdl2rest.url', () => callWsdl2RestViaUIAsync(true)));
}

function callWsdl2RestViaUIAsync(useUrl: boolean): Promise<string> {
	return new Promise <string> ( (resolve, reject) => {
		askForUserInputs(useUrl)
		.then( () => {
			callWsdl2Rest(wsdl2restExecutablePath)
				.then( success => {
					if (!success) {
						vscode.window.showErrorMessage("Unable to create the Wsdl2Rest files.");
						reject();
					}
					resolve();
					return success;
				})
				.catch(err => {
					console.error("Wsdl2Rest execution return code: " + err);
					reject();
					return err;
				});
		})
		.catch(err => {
			console.error("Error retrieving the required user inputs. " + err);
			reject();
			return err;
		});
	});
}

function askForUserInputs(useUrl: boolean): Promise<any> {
	return new Promise( async (resolve, reject) => {
		try {
			let fileUri;
			if (!useUrl) {
				fileUri = await vscode.window.showOpenDialog(utils.Options);
			} else {
				fileUri = await vscode.window.showInputBox({
					prompt: 'WSDL URL',
					placeHolder: 'Provide the URL for the WSDL file'
				});
			}
			if (fileUri && Array.isArray(fileUri)) {
				wsdlFileUri = fileUri[0] + "";
			} else if (fileUri) {
				var result = url.parse(fileUri);
				if (!result) {
					reject("WSDL URL not valid.");
				} else {
					wsdlFileUri = fileUri;
				}
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
		try {
			let storagePath: string = vscode.workspace.rootPath; // is undefined for some unknown reason
			if (!storagePath) {
				storagePath = getTempWorkspace();
			}

			if (outputDirectory.endsWith('/java')) {
				outputDirectory = outputDirectory.substring(0, outputDirectory.indexOf('/java'));
			}

			let outPath: string = path.join(storagePath, outputDirectory);
			
			if (!(wsdlFileUri.startsWith('http:') || !wsdlFileUri.startsWith('https:'))) {
				if (!wsdlFileUri.startsWith('file:')) {
					wsdlFileUri = fileUrl(wsdlFileUri);
				}
			}
			
			if (!fs.existsSync(outPath)) {
				vscode.window.showInformationMessage(`Creating Wsdl2Rest Java output directory: ` + outPath);
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
					let originalLog4JProps = wsdl2restExecutablePath.substring(0, wsdl2restExecutablePath.lastIndexOf(path.sep)+1) + "log4j.properties";
					let newLogsFolder = storagePath + path.sep + 'config';
					let newLog4JProps = newLogsFolder + path.sep + 'logging.properties';
					fs.copySync(path.resolve(originalLog4JProps), newLog4JProps);
					utils.printDebug("New config folder: " + newLogsFolder);

					let log4jConfigPath: string = fileUrl(newLog4JProps);
					utils.printDebug("Log4J Config: " + log4jConfigPath);
					javaExecutablePath = path.resolve(requirements.java_home + '/bin/java');

					let contextType = isBlueprint ? "--blueprint-context" : "--camel-context";
					let args:string[];
					args = [ "-Dlog4j.configuration=" + log4jConfigPath, 
						"-jar", wsdl2restExecutablePath,
						"--wsdl", wsdlFileUri,
						"--out", outPath,
						contextType, restContextPath];
					if (jaxrs) {
						args.push("--jaxrs");
						args.push(jaxrs);
					}
					if (jaxrs) {
						args.push("--jaxws");
						args.push(jaxws);
					}

					utils.printDebug("Java Binary: " + javaExecutablePath);
					utils.printDebug("Wsdl2Rest JAR: " + wsdl2restExecutablePath);
					utils.printDebug("Java Call: " + javaExecutablePath + "\n\t" + args);
					outputChannel.append("Executing Wsdl2Rest...\n");
					wsdl2restProcess = child_process.spawn(javaExecutablePath, args);

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
			} catch (error) {
				console.error(error);
				reject(error);
			}
		});
}

function getTempWorkspace() {
	return path.resolve(os.tmpdir(),'vscodesws_'+makeRandomHexString(5));
}

function makeRandomHexString(length) {
	var chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	var result = '';
	for (var i = 0; i < length; i++) {
		var idx = Math.floor(chars.length * Math.random());
		result += chars[idx];
	}
	return result;
}