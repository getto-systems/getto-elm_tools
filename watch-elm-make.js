"use strict";

const fs     = require("fs");
const execsh = require("exec-sh");

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
            if(!fs.existsSync(dest)) {
              rename(output,dest);
            } else {
              execsh("sha1sum "+output, true, function(err,stdout,stderr){
                let outputSum = stdout.replace(config.tmp,config.dest);
                execsh("echo '"+outputSum"' | sha1sum -c --quiet", true, function(err,stdout,stderr){
                  if(err) {
                    console.log(err);
                    return;
                  }

                  if(stdout) {
                    rename(output,dest);
                  }
                });
              });
            }
          });
        }
      });
    });
  });
  return complete;
}

const rename = function(src,dest){
  fs.rename(src, dest, function(err){
    if(err) {
      console.log(err);
    }
  });
}

fs.watchFile(config.watch.file, config.watch.options, function(current, previous){
  if(current.nlink > 0) {
    if(fs.existsSync(config.tmp)) {
      console.log("tmp directory exists. maybe working: ", config.tmp);
    } else {
      if(make(config.root)) {
        console.log("========== complete ==========");
      } else {
        console.log("********** ERROR **********");
      }
      execsh("rm -rf "+config.tmp);
    }
  }
});
