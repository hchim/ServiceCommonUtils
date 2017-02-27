/**
 * Created by huiche on 2/26/17.
 */
var assert = require('assert');
var expect = require('Chai').expect;
var utils = require('../index');

describe('nestedReqField functions', function () {
    describe('nestedReqField OKhttp', function () {
        it('should parse nested field for OKHttp', function (done) {
            body = {
                fieldName1: {
                    fieldName2 : 2
                }
            }

            expect(utils.nestedReqField(body, 'fieldName1', 'fieldName2')).to.equal(2)
            done()
        })
    })

    describe('nestedReqField simple request', function () {
        it('should parse nested field for simple request', function (done) {
            body = {
                'fieldName1[fieldName2]': 2
            }

            expect(utils.nestedReqField(body, 'fieldName1', 'fieldName2')).to.equal(2)
            done()
        })
    })
})