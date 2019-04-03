# Change Log
All notable changes to the "vscode-wsdl2rest" extension will be documented in this file.

## 0.0.7
- updated readme with additional help and clarification

## 0.0.6
- updated to use wsdl2rest version 0.8.0.fuse-730050
- made jax-ws and jax-rs URL prompts optional to use the underlying wsdl2rest ability to pull the jax-ws URL directly from the WSDL if it's specified there and using the standard wsdl2rest defaults rather than overwriting them each time https://github.com/camel-tooling/vscode-wsdl2rest/issues/34

## 0.0.5
- addressed issue with URL-based WSDL files https://github.com/camel-tooling/vscode-wsdl2rest/issues/36 
- addressed issue with focus loss https://github.com/camel-tooling/vscode-wsdl2rest/issues/35

## 0.0.4
- addressed issue https://github.com/camel-tooling/vscode-wsdl2rest/issues/30 

## 0.0.3
- Initial release
- Support creation of Camel Rest DSL artifacts from local WSDL file
- Support creation of Camel Rest DSL artifacts from remote (URL-accessible) WSDL file
- Published to VS Code Marketplace
