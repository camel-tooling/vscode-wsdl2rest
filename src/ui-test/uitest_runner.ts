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

import * as fsExtra from 'fs-extra';
import * as path from 'path';
import { ExTester } from 'vscode-extension-tester';
import { projectPath } from './package_data';
import { ReleaseQuality } from 'vscode-extension-tester/out/util/codeUtil';

const storageFolder = undefined;
const releaseType: ReleaseQuality = ReleaseQuality.Stable;
const extensionFolder = path.join(projectPath, '.test-extensions');

// latest version
const vscodeVersion = undefined;

async function main(): Promise<void> {
    // make sure extension folder is empty
    fsExtra.removeSync(extensionFolder);
    fsExtra.mkdirsSync(extensionFolder);

    const tester = new ExTester(storageFolder, releaseType, extensionFolder);

    await tester.downloadCode(vscodeVersion);
    await tester.downloadChromeDriver(vscodeVersion);

    await tester.runTests('out/ui-test/extension.all.test.js', {
        vscodeVersion,
        settings: 'src/ui-test/vscode-settings.json'
    });
}

main();
