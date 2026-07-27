'use strict';

var path = require('path');
var esbuild = require('esbuild');
var playwright = require('@playwright/test');
var loadAutoTests = require('../support/auto-tests').loadAutoTests;

var test = playwright.test;
var expect = playwright.expect;

test('morphdom browser suite', function({ page }) {
    return esbuild.build({
        entryPoints: [path.join(__dirname, '..', 'support', 'browser-runner.js')],
        bundle: true,
        format: 'iife',
        globalName: 'morphdomBrowserTests',
        platform: 'browser',
        target: 'es2018',
        write: false
    }).then(function(result) {
        var code = result.outputFiles[0].text;
        var autoTests = loadAutoTests();

        return page.addScriptTag({ content: code }).then(function() {
            return page.evaluate(function(autoTests) {
                return window.morphdomBrowserTests.run(autoTests);
            }, autoTests);
        });
    }).then(function(result) {
        expect(result.failures).toEqual([]);
        expect(result.failed).toBe(0);
        expect(result.total).toBeGreaterThan(0);
    });
});

test('UMD bundle exposes browser global', function({ page }) {
    return page.addScriptTag({
        path: path.join(__dirname, '..', '..', 'dist', 'morphdom-umd.js')
    }).then(function() {
        return page.evaluate(function() {
            var el = document.createElement('div');
            el.className = 'foo';

            window.morphdom(el, '<div class="bar">Hello</div>');

            return {
                type: typeof window.morphdom,
                className: el.className,
                text: el.textContent
            };
        });
    }).then(function(result) {
        expect(result).toEqual({
            type: 'function',
            className: 'bar',
            text: 'Hello'
        });
    });
});
