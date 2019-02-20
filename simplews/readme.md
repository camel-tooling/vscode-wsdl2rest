# Running the simple web server
The simple web server is available to provide a simple web service for testing. 

## Requirements
* Typescript must be installed (npm install -g typescript)
* Node.js must be installed (https://nodejs.org/en/)

## To run the server
* In the simplews directory, run the command: tsc manualstart.ts. This creates the manualstart.js file.
* Again in the simplews directory, run the command: node manualstart.js

## Accessing the server
The server provides a simple WSDL-based JAX-WS server that provides the wsdl - 'http://localhost:3000/helloworldservice?wsdl' - 
and a small back-end to provide a "hello" service.

## To stop the server
* Press Ctrl+C in the terminal window in which you ran it
