'use strict';

module.exports = {
    testDir: './test/playwright',
    reporter: process.env.CI ? 'dot' : 'list',
    use: {
        browserName: 'chromium'
    }
};
