#!/usr/bin/env node
"use strict";

const path  = require("path");
const watch = require("watch");
const spawn = require("cross-spawn");

const config = {
  make: "./node_modules/.bin/elm-make",
  root: "./src",
  tmp: "./tmp/compile",
  options: {
    interval: 0.3,
    ignoreDirectoryPattern: /EntryPoint/
  }
}

const compile = function(file){
  const proc = spawn(config.make, ["--output="+config.tmp+"/"+file+".js", file]);
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
    } else {
      console.log("");
    }
  });
}

watch.watchTree(config.root, config.options, function(file, current, previous){
  if(typeof file == "object" && previous === null && current === null) {
  } else if(previous === null) {
    // created
    compile(file);
  } else if(current.nlink === 0) {
    // removed
    console.log("removed: ", file);
  } else {
    // changed
    compile(file);
  }
});
