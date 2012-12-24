var fs = require('fs');
var flist = require('flist');
var async = require('async');
var path = require('path');
var browserify = require('browserify');

var debug = require('debug')('bundler');

module.exports = function bundle(domain, cb) {
    debug('building ' + domain);

    var files = ['default.js', 'default.coffee'];
    var domainbits = domain.split('.');

    for (var i = 0; i < domainbits.length; i++) {
        var base = domainbits.slice(i).join('.');
        files.push(base);
        files.push(base + '.js');
        files.push(base + '.coffee');
    }

    async.filter(files, fs.exists, function(items) {
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
        var domainbundle = browserify({
            cache: '.browserify_cache.json'
        });

        var cwd = process.cwd();
        domainbundle.register(function(code, fnameAbsolute) {
            var fname = path.relative(cwd, fnameAbsolute);
            if (files.indexOf(fname) == -1) return code;
            var message = JSON.stringify('error in dotjs-zen script ' + fname + ': ');
            return 'try{\n' + code + '\n} catch(e){ console.log(' + message + '); console.log(e.stack); }';
        });

        try {
            files.forEach(function(file) {
                domainbundle.addEntry(file);
            });
        }
        catch (e) {
            return process.nextTick(function() {
                var message = 'there was an error browserifying the scripts for ' + domain + ': ' + e.toString();
                console.log(message);
                cb(null, 'window.alert($);'.replace('$', JSON.stringify(message)));
            });
        }
        cb(null, domainbundle.bundle());
    }

};
