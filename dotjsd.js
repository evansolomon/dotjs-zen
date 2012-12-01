#!/usr/bin/env node

var http = require('http');
var path = require('path');
var url = require('url');
var bundler = require('./bundler');


var argv = require('optimist').usage('$0 [-d [pidfile] [-l logfile]] [-h ~/.js] [-p port]')
    .default ('p', 3131)
    .default ('l', path.join('/tmp', process.env.USER + '_djsd.log'))
    .default ('h', path.join(process.env.HOME, '.js'))
    .argv;
if (argv.d === true) argv.d = path.join('/tmp', process.env.USER + '_djsd.pid');

process.chdir(argv.h);

if (argv.d) {
    var child_process = require('child_process');
    var fs = require('fs');
    var args = [process.argv[1]];
    Object.keys(argv).forEach(function(key){
        if (key.match(/^[a-z]$/) && ['d', 'l'].indexOf(key) != -1) args.push('-' + key, argv[key]);
    });
    child_process.spawn(process.argv[0], args, {
        detached: true,
        stdio: ['ignore', fs.openSync(argv.l, 'a'), fs.openSync(argv.l, 'a')]
    });
    process.exit();
}

var debug = require('debug')('http');
var server = http.createServer(function(req, res) {
    var pathname = url.parse(req.url).pathname.replace(/\.js$/, '');
    bundler(pathname.slice(1), function(err, bundle) {
        if (err) {
            res.writeHead(500);
            return res.end(err.toString(), 'utf8');
        }
        res.end(bundle, 'utf8');
    });
});
server.listen(argv.p, function() {
    debug('listening');
});
