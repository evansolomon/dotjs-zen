var fs = require('fs');
var flist = require('flist');
var async = require('async');
var path = require('path');
var browserify = require('browserify');

var cache = Object.create(null);
var debug = require('debug')('bundler');

module.exports = function bundle(domain, cb) {
    if (cache[domain]) {
        debug('served ' + domain + ' from cache');
        return cb(null, cache[domain].bundle());
    }

    debug('building ' + domain);

    async.filter([domain, domain + '.js'], fs.exists, function(items) {
        async.map(items, flist, foundFiles);
    });

    function foundFiles(err, results) {
        if (err) return cb(err, null);
        if (!results.length) {
            debug('no scripts for ' + domain);
            return cb(null, '/* no scripts for this domain */');
        }
        var files = results.reduce(function(a, b) { //flatten the array
            return a.concat(b);
        }).filter(function(path) { //and ignore dotfiles
            return !path.match(/(^|\/)\./);
        });
        debug('found ' + files.join(', '));
        bundleBunch(files);
    }

    function bundleBunch(files) {
        var domainbundle = cache[domain] = browserify({
            cache: '.browserify_cache.json'
        });
        domainbundle.watches = Object.create(null);

        try {
            files.forEach(function(file) {
                domainbundle.addEntry(file);
            });
        } catch (e) {
            return process.nextTick(function() {
                var message = 'there was an error browserifying the scripts for ' + domain + ': ' + e.toString();
                console.log(message);
                cb(null, 'window.alert($);'.replace('$', JSON.stringify(message)));
            });
        }
        Object.keys(domainbundle.files).concat(files).forEach(function(file) {
            debug('watching ' + file);
            domainbundle.watches[file] = fs.watch(file, drop.bind(null, domain));
        });
        cb(null, domainbundle.bundle());
    }

};

function drop(domain) {
    var domainbundle = cache[domain];
    Object.keys(domainbundle.watches).forEach(function(file) {
        debug('dropping watch ' + file);
        if (domainbundle.watches[file].close) domainbundle.watches[file].close();
        delete domainbundle.watches[file];
    });
    debug('dropping ' + domain);
    delete cache[domain];
}
