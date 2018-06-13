'use strict';

var _index = require('../index');

/**
 * Created by huiche on 2/26/17.
 */
var assert = require('assert');
var expect = require('Chai').expect;


describe('nestedReqField functions', function () {
    describe('nestedReqField OKhttp', function () {
        it('should parse nested field for OKHttp', function (done) {
            var body = {
                fieldName1: {
                    fieldName2: 2
                }
            };

            expect((0, _index.nestedReqField)(body, 'fieldName1', 'fieldName2')).to.equal(2);
            done();
        });
    });

    describe('nestedReqField simple request', function () {
        it('should parse nested field for simple request', function (done) {
            var body = {
                'fieldName1[fieldName2]': 2
            };

            expect((0, _index.nestedReqField)(body, 'fieldName1', 'fieldName2')).to.equal(2);
            done();
        });
    });
});