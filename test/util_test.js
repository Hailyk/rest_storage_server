'use strict';

let test = require('unit.js');
let lib = require('../lib/util.js');


describe('Function timestamp', function() {
    it('returns string', function() {
        let timestamp = lib.timestamp();
        test
            .value(timestamp).isType('string');
    })
});