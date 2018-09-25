#!/usr/bin/env node
"use strict";

const program = require('commander');
const fs      = require("fs");
const spawn   = require("cross-spawn");

program.version(require('../package.json').version)
  .option('-f, --watch-file [watch-file]', 'The file to build when file changed. Defaults to ./tmp/build.txt.', "./tmp/build.txt")
  .parse(process.argv);

const config = {
  watch: {
    file: process.watchFile,
    options: {
      interval: 300,
    }
  }
}

fs.watchFile(config.watch.file, config.watch.options, (current, previous) => {
  if(current.nlink > 0) {
    const proc = spawn("getto-make");
    let error = new Buffer(0);

    proc.stderr.on("data", (stderr) => {
      error = Buffer.concat([error, new Buffer(stderr)]);
    });
    proc.stdout.on("data", (stdout) => {
      process.stdout.write(stdout.toString());
    });

    proc.on("close", (code) => {
      if(!!code) {
        console.log(error.toString());
      }
    });
  }
});
