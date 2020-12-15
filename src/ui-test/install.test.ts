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

import { DefaultWait, Marketplace } from 'vscode-uitests-tooling';
import {
	EditorView,
	ExtensionsViewItem,
	ExtensionsViewSection,
	SideBarView,
	VSBrowser,
} from 'vscode-extension-tester';
import { expect } from 'chai';
import { getPackageData, PackageData } from './package_data';
import * as fs from 'fs';

export function test() {
	describe('Marketplace install test', function () {
		this.timeout(3500);
		let packageData: PackageData;
		let marketplace: Marketplace;
		let section: ExtensionsViewSection;
		let wsdl2restExtension: ExtensionsViewItem;

		before('Init tester and get package data', async function () {
			this.timeout(10000);
			packageData = getPackageData();
			marketplace = await Marketplace.open();
			section = (await new SideBarView().getContent().getSection('Installed')) as ExtensionsViewSection;
		});

		after('Clear workspace', async function () {
			this.timeout(120000);
			await section.clearSearch();
			await marketplace.close();
			await new EditorView().closeAllEditors();
		});

		it('Find extension', async function () {
			this.timeout(10000);
			await DefaultWait.sleep(1000);
			wsdl2restExtension = await section.findItem(packageData.displayName);
			expect(wsdl2restExtension, 'Could not find extension').not.to.be.undefined;
		});

		it('Extension is not installed', async function () {
			expect(await wsdl2restExtension.isInstalled()).to.be.false;
		});

		it('Installs extension', async function () {
			this.timeout(80000);
			await wsdl2restExtension.install().catch((e) => expect.fail('Could not install extension: ' + e));
			expect(await wsdl2restExtension.isInstalled(), 'Could not install extension: ' + packageData.displayName).to.be.true;
		});
	});
}
