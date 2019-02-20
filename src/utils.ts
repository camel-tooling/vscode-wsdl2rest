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

import * as vscode from 'vscode';
import * as url from 'url';
import * as http from 'http';
import * as path from 'path';
import * as os from 'os';

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

export function isAValidUrl(value: string): boolean {
	// can't be empty
	if (!value || value.trim().length === 0) {
		return false;
	}
	try {
		const result = url.parse(value);
		if (result.host && result.protocol) return true;
	} catch (TypeError) {
	}
	return false;
}

export async function isFileAvailable(url: string): Promise<boolean> {
	return new Promise <boolean> ( (resolve, reject) => {
			http.get(url, (res) => {
			const { statusCode } = res;
			if (statusCode === 200) {
				console.log("test url is available (" + url + "): " + statusCode);
				resolve(true);
			}
		});
		reject(false);
	});
}

export function isValidPath(text: string): boolean {
	// can't be empty
	if (!text || text.trim().length === 0) {
		return false;
	}
	let testPath = /[<>@:#"|?*]/.test(text);
	return !testPath;
}

export function getTempWorkspace() {
	return path.resolve(os.tmpdir(),'vscodesws_'+makeRandomHexString(5));
}

export function makeRandomHexString(length) {
	var chars = ['0', '1', '2', '3', '4', '5', '6', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
	var result = '';
	for (var i = 0; i < length; i++) {
		var idx = Math.floor(chars.length * Math.random());
		result += chars[idx];
	}
	return result;
}