'use strict';

import * as vscode from 'vscode';

const DEBUG_MODE: boolean = true;

export enum DslType {
	Spring = "Spring",
	SpringBoot = "Spring-Boot",
	Blueprint = "Blueprint"
}

export const Options: vscode.OpenDialogOptions = {
	canSelectMany: false,
	openLabel: 'Open WSDL File',
	filters: {
		'WSDL files': ['wsdl'],
		'All files': ['*']
	}
};

export function printDebug(message: string) {
	if (DEBUG_MODE) {
		console.error("[DEBUG] " + message);
	}	
}
