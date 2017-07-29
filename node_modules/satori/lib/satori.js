#!/usr/bin/env node

var satori,
    fs,
    readline;

satori = require('../index');
fs = require('fs');
readline = require('readline');

(function() {
    var rl;

    if(process.argv.slice(2).length > 1) {
        console.log('Usage: satori <file path>');
        console.log('Omit the file path for a REPL.');
        process.exit(0);
    }
    if(process.argv.slice(2).length === 1) {
        satori.read(fs.readFileSync(process.argv.slice(2)[0], 'utf8'));
        process.exit(0);
    }

    rl = readline.createInterface(process.stdin, process.stdout);
    rl.setPrompt('\u03BB> ');
    rl.prompt();

    rl.on('line', function(line) {
        if(line === ':quit') { rl.close(); }

        console.log('=> ' + satori.read(line));
        rl.prompt();
    }).on('close', function() { process.exit(0); });
})();
