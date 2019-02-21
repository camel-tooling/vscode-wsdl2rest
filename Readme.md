[![GitHub tag](https://img.shields.io/github/tag/camel-tooling/vscode-wsdl2rest.svg?style=plastic)]()
[![Build Status](https://travis-ci.org/camel-tooling/vscode-wsdl2rest.svg?branch=master)](https://travis-ci.org/camel-tooling/vscode-wsdl2rest)
[![License](https://img.shields.io/badge/license-Apache%202-blue.svg)]()
[![Gitter](https://img.shields.io/gitter/room/camel-tooling/Lobby.js.svg)](https://gitter.im/camel-tooling/Lobby)

# wsdl2rest for Visual Studio Code
This preview release of the extension adds wsdl2rest support to [Visual Studio Code](https://code.visualstudio.com/).

Current functionality includes:
* Specifying an existing WSDL file in the local file system and generating a Camel Rest DSL + CXF solution around it for REST-style access.
* Specifying a web-accessible WSDL file and generating a Camel Rest DSL + CXF solution around it for REST-style access.


![wsdl2rest in Command Palette](./images/wsdl2rest-dropdown.png "wsdl2rest in Command Palette")

## Contact Us
If you run into any issues or have suggestions, please file [issues and suggestions on GitHub](https://github.com/camel-tooling/vscode-wsdl2rest/issues).

## How to install
(When) the wsdl2rest Extension is available from the [VSCode Marketplace].

* Install VS Code
* Open Extensions View (Ctrl+Shift+X)
* Search for "Camel"
* Select the "wsdl2rest for Visual Studio Code" entry and click Install
* Profit!

## Using the extension
There are two main options for using the extension to generate your Camel configuration. To start the process, inside VS Code, press `F1` or `Ctrl+Shift+P` to bring up the Command Palette, and type `wsdl2rest`. Then you must choose whether you're going to use a local WSDL file or a WSDL somewhere on the network.

To reference a WSDL file in your local file system:

* Select the 'wsdl2rest: Create Camel Rest DSL configuration from local WSDL file' option in the list.
* In the File dialog that appears, browse to find your WSDL file in the local file system.

To reference a WSDL located somewhere on the Internet (or Intranet) with a URL:

* Select the 'wsdl2rest: Create Camel Rest DSL configuration from WSDL file URL' option in the list.
* In the drop-down that appears, type the URL to the WSDL you wish to access.

After that, the two paths converge and you must specify:

* which DSL to generate the Camel configuration for (Spring or Blueprint)
* the output directory for generated CXF artifacts (defaults to src/main/java)
* the address for the running jaxws endpoint (such as http://localhost:8080/somepath)
* the address for the generated jaxrs endpoint (such as http://localhost:8081/jaxrs)

At the end of the journey, the extension calls the wsdl2rest utility (https://github.com/jboss-fuse/wsdl2rest) to generate a Camel Rest configuration in your chosen DSL, plus the CXF artifacts to harness the power of your SOAP-based JAX-WS service in a RESTful way. 

