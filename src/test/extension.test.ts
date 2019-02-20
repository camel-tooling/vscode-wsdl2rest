'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import * as fileUrl from 'file-url';
import * as app_soap from './app_soap';

const extensionId = 'camel-tooling.vscode-wsdl2rest';

suite("ensure Wsdl2rest extension exists and is accessible", async function() {
	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension(extensionId));
	});

	test('should activate', async function () {
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
});
