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

/* THIS FILE WILL GO AWAY - -just keeping for the example of
running the web service - will use same approach in extension.test.ts */

'use strict';
const app_soap = require('./app_soap');
const assert = require('assert');

suite("generator-camel:wsdl2res tests", function () {
	before(function () {
		app_soap.startWebService();
		console.log('Started web service on ' + app_soap.getServiceURL());
	});

	after(function () {
		app_soap.stopWebService();
		console.log('Stopped web service on ' + app_soap.getServiceURL());
	});

	describe('Should do something with wsdl2rest', function () {
		it('Should run wsdl2rest with a set of prompts', function () {
			assert.equal(true, true); // just a placeholder
		});
	});
});