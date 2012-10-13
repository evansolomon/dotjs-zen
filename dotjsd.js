var http=require('http');
var fs=require('fs');
var flist=require('flist');

var async=require('async');
var url=require('url');
var path=require('path');

var browserify=require('browserify');
var watchTree=require('fs-watch-tree').watchTree;

process.chdir(path.join(process.env.HOME,'.js'));

var cache=Object.create(null);

(function(){
    var debug=require('debug')('cache');
    watchTree('.',{exclude:[/^\./]},function(event){
        var match=event.name.match(/^([^\/]+)(?:\/.*)?\.js$/);
        if(!match) return;
        var domain=match[1];
        if(cache[domain]&&delete cache[domain])
            debug('invalidated '+domain+' due to change in '+event.name);
        else
            debug(event.name+' changed but '+domain+' is not cached');
    });
})();

var bundle=(function(){
    var debug=require('debug')('bundler');
    function bundle(domain,cb){
        if(cache[domain]){
            debug('served '+domain+' from cache');
            return cb(null,cache[domain].bundle());
        }
        var domainbundle=cache[domain]=browserify({
            cache: '.browserify_cache.json',
            watch: true //in case require()'d stuff changes
        });
        debug('building '+domain);
        async.filter([domain,domain+'.js'],fs.exists,gotExistent);
        function gotExistent(items){
            debug('found '+items.join(' and ')+' existent');
            async.map(items,flist,function(err,results){
                if(err) return cb(err,null);
                if(!results.length) return cb(null,'');
                var allFiles=results.reduce(function(a,b){ return a.concat(b); });
                var files=allFiles.filter(function(path){
                    return !path.match(/(^|\/)\./);
                });
                debug('found '+files.join(','));
                bundleBunch(files);
            });
        }
        function bundleBunch(files){
            files.forEach(function(file){
                domainbundle.addEntry(file);
            });
            cb(null,domainbundle.bundle());
        }
    }
    return bundle;
})();

(function(){
    var debug=require('debug')('http');
    var server=http.createServer(function(req,res){
        var pathname=url.parse(req.url).pathname.replace(/\.js$/,'');
        bundle(pathname.slice(1),function(err,bundle){
            if(err){
                res.writeHead(500);
                return res.end(err.toString(),'utf8');
            }
            res.end(bundle,'utf8');
        });
    });
    server.listen(3131,function(){
        debug('listening');
    });
})();
