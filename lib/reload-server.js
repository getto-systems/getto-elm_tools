"use strict";

const http = require('http');
const connect = require('connect');
const reload = require('reload/lib/reload');
const fs = require('fs');
const clc = require('cli-color');
const serveStatic = require('serve-static');

const argv = process.argv.slice(2);

const runFile = argv.shift();
const verbose = (argv.shift() === 'true');
const port = argv.shift();
const root = argv.shift();
const reloadJs = argv.shift();
const headerFile = argv.shift();

const reloadOpts = {
  port: port,
  verbose: verbose,
  noExpress: true
};

let optionalHeaders = [];
if(fs.existsSync(headerFile)) {
  const contents = fs.readFileSync(headerFile);
  if (headerFile.match(/.json$/)) {
    JSON.parse(contents).forEach(function(header) {
      if (header.length >= 2) {
        const key = header[0];
        let value = header[1];
        if (value.join) {
          value = value.join("; ");
        }
        optionalHeaders.push([key, value]);
      }
    })
  }
}

let app = connect();
const server = http.createServer(app);
const reloadReturned = reload(function () {}, reloadOpts, server);

// Serve static files
app.use(serveStatic(root, {
  index: ['index.html'],
  setHeaders: function(res) {
    optionalHeaders.forEach(function(h) {
      res.setHeader(h[0], h[1]);
    })
  },
}));

// Serve reload-client.js file from injected script tag
app.use(function (req, res, next) {
  if (req.url === reloadJs) {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(reloadReturned.reloadClientCode());
  } else {
    next();
  }
});

server.listen(port, function () {
  if (!fs.existsSync(runFile)) {
    fs.writeFileSync(runFile);

    console.log('Reload web server:');
    console.log('  listening on port ' + clc.blue.bold(port));
    console.log('  monitoring root ' + clc.green.bold(root));
    console.log('  optional headers:\n    ' + optionalHeaders.map(function(h){return h.join(": ")}).join("\n    "));
  } else {
    console.log(clc.green('Server restarted at ' + (new Date()).toTimeString().slice(0, 8)));
  }
})
