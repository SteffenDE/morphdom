'use strict';

var morphdom = require('../../dist/morphdom.js');
var createStandaloneExpect = require('./assert').createStandaloneExpect;
var registerMorphdomTests = require('./morphdom-suite').registerMorphdomTests;

function createRunner() {
    var tests = [];
    var suiteNames = [];
    var beforeEachFns = [];

    function fullName(name) {
        return suiteNames.concat(name).join(' > ');
    }

    function addTest(name, fn, mode) {
        tests.push({
            name: fullName(name),
            fn: fn,
            mode: mode || 'run',
            beforeEachFns: beforeEachFns.slice()
        });
    }

    function describe(name, fn) {
        var beforeEachCount = beforeEachFns.length;

        suiteNames.push(name);
        fn.call({ timeout: function() {} });
        suiteNames.pop();

        beforeEachFns.length = beforeEachCount;
    }

    function it(name, fn) {
        addTest(name, fn);
    }

    it.only = function(name, fn) {
        addTest(name, fn, 'only');
    };

    function xit(name, fn) {
        addTest(name, fn, 'skip');
    }

    function beforeEach(fn) {
        beforeEachFns.push(fn);
    }

    return {
        describe: describe,
        it: it,
        xit: xit,
        beforeEach: beforeEach,
        tests: tests
    };
}

function run(autoTests) {
    var runner = createRunner();

    registerMorphdomTests({
        morphdom: morphdom,
        expect: createStandaloneExpect(),
        autoTests: autoTests,
        describe: runner.describe,
        it: runner.it,
        xit: runner.xit,
        beforeEach: runner.beforeEach
    });

    var runnableTests = runner.tests;
    var onlyTests = runnableTests.filter(function(test) {
        return test.mode === 'only';
    });

    if (onlyTests.length) {
        runnableTests = onlyTests;
    } else {
        runnableTests = runnableTests.filter(function(test) {
            return test.mode !== 'skip';
        });
    }

    var failures = [];

    runnableTests.forEach(function(test) {
        try {
            test.beforeEachFns.forEach(function(fn) {
                fn();
            });
            test.fn();
        } catch (err) {
            failures.push({
                name: test.name,
                message: err && err.message || String(err),
                stack: err && err.stack || null
            });
        }
    });

    return {
        total: runnableTests.length,
        failed: failures.length,
        failures: failures
    };
}

module.exports = {
    run: run
};
