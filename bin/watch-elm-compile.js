#!/usr/bin/env node
"use strict";

const program = require('commander');
const fs      = require("fs");
const path    = require("path");
const watch   = require("watch");
const spawn   = require("cross-spawn");

program.version(require('../package.json').version)
  .option('-d, --dir [dir]', 'The directory to watch files. Defaults to ./src.', "./src")
  .option('    --tmp [tmp]', 'The directory to generate js. Defaults to /tmp/compile', '/tmp/compile')
  .option('    --ignore [ignore]', 'The pattern to ignore watch files. Defaults to EntryPoint', 'EntryPoint')
  .parse(process.argv);

const config = {
  make: "./node_modules/.bin/elm-make",
  dir: program.dir,
  tmp: program.tmp,
  options: {
    interval: 0.3,
  },
  ignore: new RegExp(program.ignore),
}

const compile = (file) => {
  if (!fs.statSync(file).isFile()) {
    return;
  }
  if (file.match(config.ignore)) {
    return;
  }

  console.log("compile: " + file);

  const proc = spawn(config.make, ["--output="+config.tmp+"/"+file+".js", file]);
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
    } else {
      console.log("");
    }
  });
}

watch.watchTree(config.dir, config.options, (file, current, previous) => {
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
