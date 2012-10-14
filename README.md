dotjs-zen
=========
dotjs-zen is [dotjs] with a [node.js] daemon.
Unlike dotjs itself it does not use or include jQuery, but you're free to `require('jquery')`.
For showing debugging information, run it with `DEBUG='*'`.

what?
=====
dotjs-zen serves bits of JavaScript from your ~/.js folder.

For gist.github.com, it'll look for `~/.js/gist.github.com.js`, `~/.js/gist.github.com/*.js`, `~/.js/github.com.js`, `~/.js/github.com/*.js`, `~/.js/com.js` and `~/.js/com/*.js`.

dotjs-zen uses [Browserify] to bundle all the scripts and the things they `require()` up and serves them to your browser.

installation
============
You'll need [node.js].
You can install dotjs-zen through npm:

    npm install -g dotjs-zen

Run `djsd -d` at startup somehow.

Install the [Chromium/Chrome extension] and start hacking the web.

usage
=====

    djsd [-d [pidfile] [-l logfile]] [-h ~/.js] [-p port]

[dotjs]: https://github.com/defunkt/dotjs
[node.js]: http://nodejs.org/
[Browserify]: https://github.com/substack/node-browserify
[Chromium/Chrome extension]: https://github.com/downloads/nathan7/dotjs-zen/dotjs-zen.crx
