'use strict';

var morphdom = require('../..');
var createJestExpect = require('../support/assert').createJestExpect;
var loadAutoTests = require('../support/auto-tests').loadAutoTests;
var registerMorphdomTests = require('../support/morphdom-suite').registerMorphdomTests;

registerMorphdomTests({
    morphdom: morphdom,
    expect: createJestExpect(expect),
    autoTests: loadAutoTests(),
    describe: describe,
    it: it,
    xit: it.skip,
    beforeEach: beforeEach
});
