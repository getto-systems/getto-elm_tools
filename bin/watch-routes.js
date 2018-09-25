#!/usr/bin/env node
"use strict";

const program = require('commander');
const fs      = require("fs");
const yaml    = require("js-yaml");
const ejs     = require("ejs");

program.version(require('../package.json').version)
  .option('-c, --config [config]', 'Config file to generate routes. Defaults to ./config/routes.yml.', "./config/routes.yml")
  .option('    --config-encoding [config-encoding]', 'The encoding of Config file. Defaults to utf8.', "utf8")
  .option('    --template-html [template-html]', 'The template file for html. Defaults to ./templates/html.ejs.', "./templates/html.ejs")
  .option('    --template-html-dist [template-html-dist]', 'The destination root directory to generate html. Defaults to ./public/dist/', "./public/dist/")
  .option('    --template-elm [template-elm]', 'The template file for elm. Defaults to ./templates/elm.ejs.', "./templates/elm.ejs")
  .option('    --template-elm-dist [template-elm-dist]', 'The destination root directory to generate elm. Defaults to ./src/EntryPoint/', "./src/EntryPoint/")
  .option('    --template-config [template-config]', 'The template file for config. Defaults to ./templates/config.ejs.', "./templates/config.ejs")
  .option('    --template-config-dist [template-config-dist]', 'The destination root directory to generate config. Defaults to ./public/dist/config/', "./public/dist/config/")
  .parse(process.argv);

const config = {
  watch: {
    file: program.config,
    encoding: program.configEncoding,
    options: {
      interval: 300,
    }
  },
  templates: {
    html:   {template: program.templateHtml,   dist: program.templateHtmlDist,   ext: ".html"},
    elm:    {template: program.templateElm,    dist: program.templateElmDist,    ext: ".elm"},
    config: {template: program.templateConfig, dist: program.templateConfigDist, ext: ".js"},
  },
};

const template = (path,global,entries) => {
  entries.forEach((entry) => {
    if(!entry.name) {
      console.log("missing entry name: " + entry);
    } else {
      const current = path.concat(entry.name);
      if(entry.entries){
        template(current,global,entry.entries);
      } else {
        const camel = current.map(camelize);
        const data = {
          global: global,
          entry:  entry,
          info: {
            path:   current.join("/"),
            module: camel.join(".")
          }
        };

        console.log(current.join("/"));
        write(config.templates.html,   current, data);
        write(config.templates.elm,    camel,   data);
        write(config.templates.config, current, data);
      }
    }
  });
}

const write = (template,path,data) => {
  const file = template.dist + path.join("/") + template.ext;
  ejs.renderFile(template.template, data, {}, (err,str) => {
    if(err) {
      console.log(err);
    } else {
      mkdir(template.dist, path.slice(0,-1));
      fs.writeFile(file, str, (err) => {
        if(err) {
          console.log(err);
        }
      })
    }
  });
}

const mkdir = (root,paths) => {
  var tips = [];
  paths.forEach((tip) => {
    tips.push(tip);
    const path = root + tips.join("/");
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  });
}

const camelize = (path) => {
  return path.split("_").map((tip) => {
    if(tip.length == 0) {
      return tip;
    } else {
      return tip[0].toUpperCase() + tip.substring(1);
    }
  }).join("");
}

fs.watchFile(config.watch.file, config.watch.options, (current, previous) => {
  if(current.nlink > 0) {
    try {
      const data = yaml.safeLoad(fs.readFileSync(config.watch.file, config.watch.encoding));
      template([], data.global, data.entries);
    } catch (e) {
      console.log(e.message);
    }
  }
});
