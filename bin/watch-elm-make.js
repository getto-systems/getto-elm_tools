#!/usr/bin/env node
"use strict";

const fs    = require("fs");
const spawn = require("cross-spawn");

const config = {
  watch: {
    file: "./tmp/build.txt",
    options: {
      interval: 300
    }
  }
}

fs.watchFile(config.watch.file, config.watch.options, function(current, previous){
  if(current.nlink > 0) {
    const proc = spawn("getto-make");
    var error = new Buffer(0);

    proc.stderr.on("data", function(stderr){
      error = Buffer.concat([error, new Buffer(stderr)]);
    });
    proc.stdout.on("data", function(stdout){
      process.stdout.write(stdout.toString());
    });

    proc.on("close", function(code){
      if(!!code) {
        console.log(error.toString());
      }
    });
  }
});
