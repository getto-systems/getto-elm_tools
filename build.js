#!/usr/bin/env node
"use strict";

const fs     = require("fs");
const execsh = require("exec-sh");
const uglify = require("uglify-js");

const config = {
  watch: {
    file: "./tmp/build.txt",
    options: {
      interval: 300
    }
  },
  root: "./src/EntryPoint",
  dest: "./public/dist/app",
  tmp:  "./tmp/app"
}

const make = function(root){
  var complete = true;
  fs.readdir(root, function(err, files){
    if(err) {
      console.log(err);
      return;
    }

    files.forEach(function(file){
      fs.stat(file, function(err,stats){
        if(err) {
          console.log(err);
          return;
        }

        if(stats.isDirectory()) {
          if(make(file)) {
            complete = false;
          }
        } else if(stats.isFile()) {
          let path = file.split("/").map(function(tip){ return snake(tip); }).join("/").replace(/.elm$/, ".js");
          let output = config.tmp + "/" + path;
          execsh("npm run elm -- make "+file+" --output "+output, true, function(err){
            if(err) {
              complete = false;
              return;
            }

            let dest = config.dest + "/" + path;
            fs.rename(src, dest, function(err){
              if(err) {
                console.log(err);
              }

              let code = fs.readFileSync(dest);
              let result = uglify.minify(code);
              fs.writeFile(dest.replace(/.js$/,".min.js"), result.code, function(err){
                if(err) {
                  console.log(err);
                }
              });
            });
          });
        }
      });
    });
  });
  return complete;
}

if(fs.existsSync(config.tmp)) {
  console.log("tmp directory exists. maybe working: ", config.tmp);
  process.exit(1);
} else {
  let result = make(config.root);
  execsh("rm -rf "+config.tmp);
  if(result) {
    console.log("========== complete ==========");
  } else {
    console.log("********** ERROR **********");
    process.exit(1);
  }
}
