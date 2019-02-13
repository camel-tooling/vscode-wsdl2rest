'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs-extra';

const fileUrl = require('file-url');
const exec = require('child_process').exec;

var wsdl2restJarPath :string;
var logPath :string;
var storagePath;

export function activate(context: vscode.ExtensionContext) {

	storagePath = vscode.workspace.rootPath;

	wsdl2restJarPath = context.asAbsolutePath(path.join('wsdl2rest', 'target', 'wsdl2rest-fatjar-0.0.1-SNAPSHOT.jar'));
	logPath = context.asAbsolutePath(path.join('wsdl2rest', 'config', 'logging.properties'));
	console.log(wsdl2restJarPath);

	let disposable = vscode.commands.registerCommand('extension.wsdl2rest', () => {
		doWsdl2Rest(context);
	});

	context.subscriptions.push(disposable);
}

async function callWsdl2Rest(outputDirectory:any, wsdlUrl:any, dsl:any, jaxrs:any, jaxws:any, isDebug:boolean) {
	let logUrl = fileUrl(logPath);

	let actualJavaOutDirectory:String = outputDirectory;
	if (actualJavaOutDirectory.endsWith('/java')) {
		actualJavaOutDirectory = actualJavaOutDirectory.substring(0, actualJavaOutDirectory.indexOf("/java"));
	}
	let outPath:String = path.join(storagePath, actualJavaOutDirectory.toString());	

	let wsdlFileUrl:String;
	if (wsdlUrl.startsWith('http')) {
		wsdlFileUrl = wsdlUrl;
	} else if (!wsdlUrl.startsWith('file:')) {
		wsdlFileUrl = fileUrl(wsdlUrl);
	} else {
		wsdlFileUrl = wsdlUrl;
	}
 
	if (!fs.existsSync(outPath.toString())){
		console.log(`Creating wsdl2rest java output directory`);
		await fs.ensureDir(outPath.toString());
	}

	var restContextPath;
	var rawContextPath:any;

	const isBlueprint:boolean = dsl.match(/blueprint/i);
	const isSpringBoot:boolean = dsl.match(/spring-boot/i);
	const isSpring:boolean = dsl.match(/spring/i);

	if (isBlueprint) {
		rawContextPath = "src/main/resources/OSGI-INF/blueprint/blueprint.xml";
	} else if (isSpringBoot) {
		rawContextPath = "src/main/resources/camel-context.xml";
	} else if (isSpring) {
		rawContextPath = "src/main/resources/META-INF/spring/camel-context.xml";
	}
	restContextPath = path.join(storagePath, rawContextPath);

	// build the java command with classpath, class name, and the passed parameters
	var cmdString = 'java '
		+ ' -Dlog4j.configuration=' + logUrl
		+ ' -jar ' + wsdl2restJarPath
		+ ' --wsdl ' + wsdlFileUrl
		+ ' --out ' + outPath;

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
		const wsdl2rest = exec(cmdString);
		if (isDebug) {
			wsdl2rest.stdout.on('data', function (data:any) {
				console.log(`stdout: ${data}`);
			});
			wsdl2rest.stderr.on('data', function (data:any) {
				console.log(`stderr: ${data}`);
			});
		}
		wsdl2rest.on('close', function (code:any) {
			if (code === 0) {
				vscode.window.showInformationMessage('   create CXF artifacts for specified WSDL at ' + outputDirectory);
				vscode.window.showInformationMessage('   create ' + rawContextPath);
				resolve();
			} else {
				reject();
				vscode.window.showErrorMessage(`   stderr: ${code}`);
				vscode.window.showErrorMessage(`   wsdl2rest did not generate artifacts successfully - please check the log file for details or re-run with --debug flag`);
			}
		});    
	});	
}

async function doWsdl2Rest(context: vscode.ExtensionContext) {
	const options: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Open WSDL File',
		filters: {
			'WSDL files': ['wsdl'],
			'All files': ['*']
	   }
	};

	try {
		let wsdlFileUri:any = await vscode.window.showOpenDialog(options);
		if (wsdlFileUri) {
			let dslChoice = await vscode.window.showQuickPick(['Spring', 'Blueprint'], 
				{placeHolder:'Specify which DSL to generate the Camel configuration for'});
			if (dslChoice) {
				vscode.window.showInformationMessage(`DSL Choice: ${dslChoice}`);
				let outputDir = await vscode.window.showInputBox({prompt:'Output Directory', placeHolder:'Enter the output directory for generated artifacts', value: 'src/main/java'});
				if (outputDir) {
					let jaxWs = await vscode.window.showInputBox({prompt:'JAXWS Endpoint', placeHolder:'Enter the address for the running jaxws endpoint', value: 'http://localhost:8080/somepath'});
					if (jaxWs) {
						let jaxRs = await vscode.window.showInputBox({prompt:'JAXRS Endpoint', placeHolder:'Enter the address for the jaxrs endpoint', value: 'http://localhost:8081/jaxrs'});
						if (jaxRs) {
							await callWsdl2Rest(outputDir, wsdlFileUri.toString(), dslChoice, jaxRs, jaxWs, true);
						}
					}
				}
			}
		}
	} catch (error) {
		vscode.window.showErrorMessage("Error while processing wsdl2rest: " + error);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
}