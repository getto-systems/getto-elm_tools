#!/usr/bin/env node
"use strict";

const watch  = require("watch");
const execsh = require("exec-sh");

const config = {
  root: "./src",
  options: {
    ignoreDirectoryPattern: /EntryPoint/
  }
}

const compile = function(file){
  execsh([
    "npm run elm -- make "+file+" --output=tmp/compile/"+file+".js",
    "rm -rf tmp/compile",
    "echo"
  ]);
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
