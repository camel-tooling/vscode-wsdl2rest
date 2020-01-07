# Spring Camel Rest example using camel:run

This project is used as template when testing wsdl2rest vscode
extension. To run this project you must do following steps.

## Steps using wsdl2rest vscode extension

1. Create or find wsdl file. It can be file in filesystem or url to file.
2. Run extension command.
    1. Open command palette (press `F1` key or `Ctrl+Shift+P` combination).
    2. Start writing `wsdl2rest:` and choose **local file** or **url**.
    3. Follow all remaining steps. For further details see [the extension github page][wsdl2rest].
3. Run command from command line `mvn -Dcamel.version=<version> -Dcamel.maven.plugin.version=<camel maven plugin version> camel:run`


## Build steps

To build this project use

`mvn -Dcamel.version=<version> -Dcamel.maven.plugin.version=<camel maven plugin version> clean install`

[wsdl2rest]: https://github.com/camel-tooling/vscode-wsdl2rest
