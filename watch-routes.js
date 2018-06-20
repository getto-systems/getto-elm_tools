#!/usr/bin/env node
"use strict";

const fs   = require("fs");
const yaml = require("js-yaml");
const ejs  = require("ejs");

const config = {
  watch: {
    file: "./config/routes.yml",
    encoding: "utf8",
    options: {
      interval: 300
    }
  },
  templates: {
    html: {template: "templates/page.html", root: "./public/",         ext: ".html"},
    elm:  {template: "templates/page.elm",  root: "./src/EntryPoint/", ext: ".elm"},
  }
};

const template = function(path,global,entries){
  entries.forEach(function(entry){
    if(!entry.name) {
      console.log("missing entry name: " + entry);
    } else {
      let current = path.concat(entry.name);
      if(entry.entries){
        template(current,global,entry.entries);
      } else {
        let camel = current.map(camelize);
        let data = {
          global: global,
          entry:  entry,
          info: {
            path:   current.join("/"),
            module: camel.join(".")
          }
        };

        console.log(current.join("/"));
        write(config.templates.html, current, data);
        write(config.templates.elm,  camel,   data);
      }
    }
  });
}

const write = function(template,path,data){
  let file = template.root + path.join("/") + template.ext;
  ejs.renderFile(template.template, data, {}, function(err,str){
    if(err) {
      console.log(err);
    } else {
      mkdir(template.root, path.slice(0,-1));
      fs.writeFile(file, str, function(err){
        if(err) {
          console.log(err);
        }
      })
    }
  });
}

const mkdir = function(root,paths) {
  var tips = [];
  paths.forEach(function(tip){
    tips.push(tip);
    let path = root + tips.join("/");
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  });
}

const camelize = function(path){
  return path.split("_").map(function(tip){
    if(tip.length == 0) {
      return tip;
    } else {
      return tip[0].toUpperCase() + tip.substring(1);
    }
  }).join("");
}

fs.watchFile(config.watch.file, config.watch.options, function(current, previous){
  if(current.nlink > 0) {
    try {
      let data = yaml.safeLoad(fs.readFileSync(config.watch.file, config.watch.encoding));
      template([], data.global, data.entries);
    } catch (e) {
      console.log(e.message);
    }
  }
});
