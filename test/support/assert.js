'use strict';

function format(value) {
    if (typeof value === 'string') {
        return JSON.stringify(value);
    }

    if (value && value.nodeType) {
        return value.outerHTML || value.nodeName;
    }

    return JSON.stringify(value);
}

function deepEqual(actual, expected) {
    if (Object.is(actual, expected)) {
        return true;
    }

    if (typeof actual !== typeof expected || actual == null || expected == null) {
        return false;
    }

    if (Array.isArray(actual) || Array.isArray(expected)) {
        if (!Array.isArray(actual) || !Array.isArray(expected) || actual.length !== expected.length) {
            return false;
        }

        for (var i = 0; i < actual.length; i++) {
            if (!deepEqual(actual[i], expected[i])) {
                return false;
            }
        }

        return true;
    }

    if (typeof actual === 'object') {
        var actualKeys = Object.keys(actual);
        var expectedKeys = Object.keys(expected);

        if (actualKeys.length !== expectedKeys.length) {
            return false;
        }

        for (var k = 0; k < actualKeys.length; k++) {
            var key = actualKeys[k];
            if (!Object.prototype.hasOwnProperty.call(expected, key) || !deepEqual(actual[key], expected[key])) {
                return false;
            }
        }

        return true;
    }

    return false;
}

function createStandaloneExpect() {
    return function expect(actual) {
        var to = {
            equal: function(expected) {
                if (!Object.is(actual, expected)) {
                    throw new Error('Expected ' + format(actual) + ' to equal ' + format(expected));
                }
            }
        };

        Object.defineProperty(to, 'be', {
            get: function() {
                return Object.defineProperty({}, 'ok', {
                    get: function() {
                        if (!actual) {
                            throw new Error('Expected ' + format(actual) + ' to be truthy');
                        }
                        return true;
                    }
                });
            }
        });

        to.deep = {
            equal: function(expected) {
                if (!deepEqual(actual, expected)) {
                    throw new Error('Expected ' + format(actual) + ' to deeply equal ' + format(expected));
                }
            }
        };

        return { to: to };
    };
}

function createJestExpect(jestExpect) {
    return function expect(actual) {
        var to = {
            equal: function(expected) {
                jestExpect(actual).toBe(expected);
            }
        };

        Object.defineProperty(to, 'be', {
            get: function() {
                return Object.defineProperty({}, 'ok', {
                    get: function() {
                        jestExpect(actual).toBeTruthy();
                        return true;
                    }
                });
            }
        });

        to.deep = {
            equal: function(expected) {
                jestExpect(actual).toEqual(expected);
            }
        };

        return { to: to };
    };
}

module.exports = {
    createJestExpect: createJestExpect,
    createStandaloneExpect: createStandaloneExpect
};
