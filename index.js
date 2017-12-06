#!/usr/bin/env node
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');
const queryString = require('query-string');

let host = process.argv[2];
let mainFolder = process.argv[3] || 'logger';
var d = new Date();

let currentTime = [d.toDateString(),d.getHours(),d.getMinutes(),d.getSeconds()].join('_');
// foreach reporting create a dir and path variable
let pathToConsoleLogger = path.join(process.cwd(),mainFolder, currentTime, 'Logger');
let pathToNielsen = path.join(process.cwd(),mainFolder, currentTime, 'nielsen');
let pathToAdobe = path.join(process.cwd(),mainFolder, currentTime, 'adobe');
let pathToNewrelic = path.join(process.cwd(),mainFolder, currentTime, 'newrelic');


if (!fs.existsSync(path.join(process.cwd(), mainFolder))){
    fs.mkdirSync( path.join(process.cwd(), mainFolder));
}
if (!fs.existsSync(path.join(process.cwd(), mainFolder, currentTime))){
    fs.mkdirSync( path.join(process.cwd(), mainFolder, currentTime));
}

 let wstreamConsoleLogger = fs.createWriteStream(pathToConsoleLogger+'.txt');
 let wstreamNielsen = fs.createWriteStream(pathToNielsen+'.txt');
 let wstreamAdobe = fs.createWriteStream(pathToAdobe+'.txt');
 let wstreamNewrelic = fs.createWriteStream(pathToNewrelic+'.txt');

CDP({ host }, (client) => {
    let currentJsonRequest;
    // extract domains
    const { Network,Runtime } = client;
    Runtime.consoleAPICalled((params) => {
        wstreamConsoleLogger.write(JSON.stringify(params));
        wstreamConsoleLogger.write("\r\n")
    });

    // setup handlers
    Network.requestWillBeSent((params) => {
        if((params.request.url).indexOf('imr') >= 0){
            wstreamNielsen.write("------------------------------------- \r\n");
            currentJsonRequest=queryString.parse(JSON.stringify(params.request.url));
            for (var key in currentJsonRequest) {
                wstreamNielsen.write(key +' : '+currentJsonRequest[key]);
                wstreamNielsen.write("\r\n")
            }
        }else if((params.request.url).indexOf('s:asset') >= 0){
            wstreamAdobe.write("------------------------------------- \r\n")
            currentJsonRequest=queryString.parse(JSON.stringify(params.request.url));
            for (var key in currentJsonRequest) {
                wstreamAdobe.write(key +' : '+currentJsonRequest[key]);
                wstreamAdobe.write("\r\n")
            }

        }else if((params.request.url).indexOf('bam') >= 0){
            wstreamNewrelic.write("------------------------------------- \r\n")
            currentJsonRequest=queryString.parse(JSON.stringify(params.request.url));
            for (var key in currentJsonRequest) {
                wstreamNewrelic.write(key +' : '+currentJsonRequest[key]);
                wstreamNewrelic.write("\r\n")
            }
        }
    });
    Promise.all([
        Network.enable(),Runtime.enable()
    ]).then(() => {
        // return Page.navigate({url: 'https://github.com'});
        return;
    }).catch((err) => {
        console.error(err);
        client.close();
    });
}).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error(err);
});