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

import { after, before, DefaultWait, Marketplace, Workbench } from 'vscode-uitests-tooling';
import {
	EditorView,
	ExtensionsViewItem,
	InputBox
} from 'vscode-extension-tester';
import { expect } from 'chai';
import { getPackageData, PackageData } from './package_data';

export function test() {
	describe('Marketplace extension test', function () {
		this.timeout(60000);
		let packageData: PackageData;
		let marketplace: Marketplace;
		let wsdl2restExtension: ExtensionsViewItem;

		before('Init tester and get package data', async function () {
			this.retries(3);
			packageData = getPackageData();
			marketplace = await Marketplace.open(this.timeout() - 1000);
		});

		after('Clear workspace', async function () {
			await marketplace?.clearSearch(this.timeout() - 1000);
			await new EditorView().closeAllEditors();
		});

		it('Find extension', async function () {
			await DefaultWait.sleep(1000);
			wsdl2restExtension = await marketplace.findExtension(`@installed ${packageData.displayName}`, this.timeout() - 1000);
			expect(wsdl2restExtension).not.to.be.undefined;
		});

		it('Extension is installed', async function () {
			expect(await wsdl2restExtension.isInstalled()).to.be.true;
		});

		it('Extensions has expected title', async function () {
			expect(await wsdl2restExtension.getTitle()).to.equal(packageData.displayName);
		});

		it('Owner of the extension is Red Hat', async function () {
			expect(await wsdl2restExtension.getAuthor()).to.equal('Red Hat');
		});

		it('The extension has correct description', async function () {
			expect(await wsdl2restExtension.getDescription()).to.equal(packageData.description);
		});

		it('Registered all commands', async function () {
			const cmd = await new Workbench().openCommandPrompt() as InputBox;
			await cmd.setText('>wsdl2rest');
			// wait for suggestions to show
			await DefaultWait.sleep(750);
			const quickPicks = await cmd.getQuickPicks();
			const suggestions = await Promise.all(quickPicks.map(q => q.getText()));
			const commands = packageData.contributes.commands.map(x => x.title);

			expect(suggestions).to.have.all.members(commands);
			await cmd.cancel();
		});
	});
}
