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
    var daemon = require('daemon');
    daemon.daemonize(argv.l, argv.d);
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
