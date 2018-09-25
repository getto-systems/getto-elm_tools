#!/usr/bin/env node
"use strict";

const program = require('commander');
const supervisor = require('supervisor');
const path = require('path');
const os = require('os');

program.version(require('../package.json').version)
  .option('-d, --dir [dir]', 'The directory to serve up. Defaults to current dir.', process.cwd())
  .option('-w, --watch-dir [watch-dir]', 'The directory to watch. Defaults the serving directory.')
  .option('-e, --exts [extensions]', 'Extensions separated by commas or pipes. Defaults to html,js,css.', 'html|js|css')
  .option('-p, --port [port]', 'The port to bind to. Can be set with PORT env variable as well. Defaults to 8080', '8080')
  .option('-v, --verbose [verbose]', 'Turning on logging on the server and client side. Defaults to false', false)
  .option('    --reload-js [reload-js]', 'The script to reload browser when contents changed. Defaults to /reload/reload.js', '/reload/reload.js')
  .option('    --header-file [header-file]', 'Optional http headers for serving contents. Defaults to headers.json', 'headers.json')
  .parse(process.argv);

const serverFile = path.join(__dirname, '../lib/reload-server.js');
const runFile = path.join(os.tmpdir(), 'reload-' + Math.random().toString().slice(2));

// replace comma for pipe, that's what supervisor likes
if (program.exts.indexOf(',')) {
  program.exts = program.exts.replace(/,/g, '|');
}

// Fall back to the serving directory.
if (typeof program.watchDir === 'undefined') {
  program.watchDir = program.dir;
}

supervisor.run([
  '-e', program.exts,
  '-w', program.watchDir,
  '-q',
  '--',
  serverFile,
  runFile,
  program.verbose,
  program.port,
  program.dir,
  program.reloadJs,
  program.headerFile,
]);
