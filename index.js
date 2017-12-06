#!/usr/bin/env node
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');
const queryString = require('query-string');

let host = process.argv[2];
let currentTime = Date.now().toString();
// foreach reporting create a dir and path variable
let pathToNielsen = path.join(process.cwd(), currentTime, 'nielsen');
let pathToAdobe = path.join(process.cwd(), currentTime, 'adobe');
let pathToNewrelic = path.join(process.cwd(), currentTime, 'newrelic');

if (!fs.existsSync(path.join(process.cwd(), currentTime))){
    fs.mkdirSync( path.join(process.cwd(), currentTime));
}
// if (!fs.existsSync(path.join(process.cwd(), currentTime))){
//     fs.mkdirSync( path.join(process.cwd(), currentTime));
// }
// if (!fs.existsSync(pathToNielsen)){
//     fs.mkdirSync(pathToNielsen);
// }
// if (!fs.existsSync(pathToAdobe)){
//     fs.mkdirSync(pathToAdobe);
// }
// if (!fs.existsSync(pathToNewrelic)){
//     fs.mkdirSync(pathToNewrelic);
// }


// fs.mkdirSync(pathToNielsen);
// fs.mkdirSync(pathToAdobe);
// fs.mkdirSync(pathToNewrelic);

// var wstream = fs.createWriteStream(pathToNielsen+'.txt');

 let wstreamNielsen = fs.createWriteStream(pathToNielsen+'.txt');
 let wstreamAdobe = fs.createWriteStream(pathToAdobe+'.txt');
 let wstreamNewrelic = fs.createWriteStream(pathToNewrelic+'.txt');

CDP({ host }, (client) => {
    let currentJsonRequest;
    // extract domains
    const { Network } = client;
    // setup handlers
    Network.requestWillBeSent((params) => {
        if((params.request.url).indexOf('imr') >= 0){
            wstreamNielsen.write("------------------------------------- \r\n");
            currentJsonRequest=queryString.parse(JSON.stringify(params.request.url));
            for (var key in currentJsonRequest) {
                wstreamNielsen.write(key +' : '+currentJsonRequest[key]);
                wstreamNielsen.write("\r\n")
            }
            // wstreamNielsen.write(JSON.stringify(params.request.url).toString())
            // wstreamNielsen.write(queryString.parse(JSON.stringify(params.request.url)).toString());
            // console.log(queryString.parse(params.request.url));
        }else if((params.request.url).indexOf('s:asset') >= 0){
            wstreamAdobe.write("------------------------------------- \r\n")
            // wstreamAdobe.write(JSON.stringify(params.request.url).toString())
            // wstreamAdobe.write(queryString.parse(JSON.stringify(params.request.url)).toString());
            // console.log(queryString.parse(params.request.url));
            currentJsonRequest=queryString.parse(JSON.stringify(params.request.url));
            for (var key in currentJsonRequest) {
            // wstreamAdobe.write(queryString.parse(JSON.stringify(params.request.url)).toString());
                wstreamAdobe.write(key +' : '+currentJsonRequest[key]);
                wstreamAdobe.write("\r\n")
                // console.log(key);
                // console.log(JsonObj[key]);
            }

        }else if((params.request.url).indexOf('bam') >= 0){
            wstreamNewrelic.write("------------------------------------- \r\n")
            currentJsonRequest=queryString.parse(JSON.stringify(params.request.url));
            for (var key in currentJsonRequest) {
                wstreamNewrelic.write(key +' : '+currentJsonRequest[key]);
                wstreamNewrelic.write("\r\n")
                // console.log(key);
                // console.log(JsonObj[key]);
            }
            // wstreamNewrelic.write(JSON.stringify(params.request.url).toString())
            // wstreamNewrelic.write(queryString.parse(JSON.stringify(params.request.url)).toString());
            console.log(queryString.parse(params.request.url));
            // console.log(params.request.url);
        }
    });
    Promise.all([
        Network.enable()
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