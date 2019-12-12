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

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

// start of package.json interfaces
export interface Command {
	command: string;
	title: string;
}

export interface Contributes {
	commands: Array<Command>;
}

export interface PackageData {
	displayName?: string;
	description?: string;
	contributes?: Contributes;
}
// end of package.json interfaces

const projectPath = path.resolve(__dirname, '..', '..');

assert.ok(fs.existsSync(path.join(projectPath, 'package.json')), `Project path is invalid. package.json was not found. (projectPath=${projectPath})`);

/**
 * Get package.json data
 * @returns interface with data required for ui-tests. For more data, cast it to `{key: string}: string` type
 */
export function getPackageData(): PackageData {
	if (packageData !== undefined) {
		return packageData;
	}

	packageData = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), { encoding: 'utf8' }));
	return packageData;
}

let packageData: PackageData = undefined;

export { projectPath };
