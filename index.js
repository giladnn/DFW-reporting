#!/usr/bin/env node
const CDP = require('chrome-remote-interface');
const fs = require('fs');
const path = require('path');
let host = process.argv[2];
let currentTime = Date.now().toString();
// foreach reporting create a dir and path variable
let pathToNielsen = path.join(process.cwd(), currentTime, 'nielsen');
// fs.mkdirSync(pathToNielsen);
console.log(1)
CDP({ host }, (client) => {

    // extract domains
    const { Network } = client;
    // setup handlers
    Network.requestWillBeSent((params) => {
        console.log(params.request.url);
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