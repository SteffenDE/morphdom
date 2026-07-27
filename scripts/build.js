'use strict';

var esbuild = require('esbuild');
var fs = require('fs');
var path = require('path');

var rootDir = path.join(__dirname, '..');
var distDir = path.join(rootDir, 'dist');

var morphdomEntry = "import morphdom from './src/index.js';\nmodule.exports = morphdom;\n";
var factoryEntry = "import morphdomFactory from './src/morphdom.js';\nmodule.exports = morphdomFactory;\n";

function stdin(contents, sourcefile) {
    return {
        contents: contents,
        resolveDir: rootDir,
        sourcefile: sourcefile,
        loader: 'js'
    };
}

function wrapUmd(bundle, minify) {
    if (minify) {
        return '(function(global,factory){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=factory();}else if(typeof define==="function"&&define.amd){define(factory);}else{global=global||self;global.morphdom=factory();}})(this,function(){' + bundle + ';return morphdom;});\n';
    }

    return [
        '(function (global, factory) {',
        "  if (typeof exports === 'object' && typeof module !== 'undefined') {",
        '    module.exports = factory();',
        "  } else if (typeof define === 'function' && define.amd) {",
        '    define(factory);',
        '  } else {',
        '    global = global || self;',
        '    global.morphdom = factory();',
        '  }',
        '})(this, function () {',
        bundle,
        '  return morphdom;',
        '});',
        ''
    ].join('\n');
}

function browserBundle(minify) {
    return esbuild.build({
        stdin: stdin(morphdomEntry, 'morphdom-browser-entry.js'),
        bundle: true,
        format: 'iife',
        globalName: 'morphdom',
        platform: 'browser',
        target: 'es5',
        minify: minify,
        legalComments: 'none',
        write: false
    }).then(function(result) {
        return result.outputFiles[0].text;
    });
}

function build() {
    fs.mkdirSync(distDir, { recursive: true });

    return Promise.all([
        esbuild.build({
            stdin: stdin(morphdomEntry, 'morphdom-cjs-entry.js'),
            bundle: true,
            format: 'cjs',
            platform: 'browser',
            target: 'es5',
            outfile: path.join(distDir, 'morphdom.js'),
            legalComments: 'none'
        }),
        esbuild.build({
            stdin: stdin(factoryEntry, 'morphdom-factory-cjs-entry.js'),
            bundle: true,
            format: 'cjs',
            platform: 'browser',
            target: 'es5',
            outfile: path.join(distDir, 'morphdom-factory.js'),
            legalComments: 'none'
        }),
        esbuild.build({
            entryPoints: [path.join(rootDir, 'src/index.js')],
            bundle: true,
            format: 'esm',
            platform: 'browser',
            target: 'es2015',
            outfile: path.join(distDir, 'morphdom-esm.js'),
            legalComments: 'none'
        }),
        browserBundle(false).then(function(bundle) {
            fs.writeFileSync(path.join(distDir, 'morphdom-umd.js'), wrapUmd(bundle, false));
        }),
        browserBundle(true).then(function(bundle) {
            fs.writeFileSync(path.join(distDir, 'morphdom-umd.min.js'), wrapUmd(bundle, true));
        })
    ]);
}

build().catch(function(err) {
    console.error(err);
    process.exit(1);
});
