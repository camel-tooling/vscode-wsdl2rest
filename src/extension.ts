'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.wsdl2rest', () => {
		doWsdl2Rest();
	});

	context.subscriptions.push(disposable);
}

async function doWsdl2Rest() {
	const options: vscode.OpenDialogOptions = {
		canSelectMany: false,
		openLabel: 'Open WSDL File',
		filters: {
			'WSDL files': ['wsdl'],
			'All files': ['*']
	   }
	};

	try {
		let wsdlFileUri = await vscode.window.showOpenDialog(options);
		if (wsdlFileUri) {
			let dslChoice = await vscode.window.showQuickPick(['Spring', 'Blueprint'], {placeHolder:'Specify which DSL to generate the Camel configuration for'});
			if (dslChoice) {
				let outputDir = await vscode.window.showInputBox({prompt:'Output Directory', placeHolder:'Enter the output directory for generated artifacts', value: 'src/main/java'});
				if (outputDir) {
					let jaxWs = await vscode.window.showInputBox({prompt:'JAXWS Endpoint', placeHolder:'Enter the address for the running jaxws endpoint', value: 'http://localhost:8080/somepath'});
					if (jaxWs) {
						let jaxRs = await vscode.window.showInputBox({prompt:'JAXRS Endpoint', placeHolder:'Enter the address for the jaxrs endpoint', value: 'http://localhost:8081/jaxrs'});
						if (jaxRs) {
							var cmdString = 'java '
							+ ' --wsdl ' + wsdlFileUri
							+ ' --out ' + outputDir;
					
							if (dslChoice.match('Blueprint')) {
								cmdString = cmdString + ' --blueprint-context ';
							} else {
								cmdString = cmdString + ' --camel-context ';
							}

							if (jaxRs) {
								cmdString = cmdString + ' --jaxrs ' + jaxRs;
							}
							if (jaxWs) {
								cmdString = cmdString + ' --jaxws ' + jaxWs;
							}
							vscode.window.showInformationMessage('   wsdl2rest command used: ' + cmdString);
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