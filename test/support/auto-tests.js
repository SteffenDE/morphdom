'use strict';

var fs = require('fs');
var path = require('path');

var autotestDir = path.join(__dirname, '..', 'fixtures', 'autotest');

function loadAutoTests() {
    var htmlStrings = {};

    fs.readdirSync(autotestDir).sort().forEach(function(dir) {
        var modulePath = path.join(autotestDir, dir, 'index.js');
        var moduleStr = null;

        if (fs.existsSync(modulePath)) {
            moduleStr = fs.readFileSync(modulePath, { encoding: 'utf8' });
        }

        htmlStrings[dir] = {
            from: fs.readFileSync(path.join(autotestDir, dir, 'from.html'), { encoding: 'utf8' }),
            to: fs.readFileSync(path.join(autotestDir, dir, 'to.html'), { encoding: 'utf8' }),
            module: moduleStr,
            only: process.env.TEST === dir
        };
    });

    return htmlStrings;
}

module.exports = {
    loadAutoTests: loadAutoTests
};
