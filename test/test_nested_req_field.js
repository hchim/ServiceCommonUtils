/**
 * Created by huiche on 2/26/17.
 */
const assert = require('assert');
const expect = require('Chai').expect;
import {nestedReqField} from '../index';

describe('nestedReqField functions', () => {
    describe('nestedReqField OKhttp', () => {
        it('should parse nested field for OKHttp', (done) => {
            const body = {
                fieldName1: {
                    fieldName2 : 2
                }
            };

            expect(nestedReqField(body, 'fieldName1', 'fieldName2')).to.equal(2);
            done();
        });
    });

    describe('nestedReqField simple request', () => {
        it('should parse nested field for simple request', (done) => {
            const body = {
                'fieldName1[fieldName2]': 2
            };

            expect(nestedReqField(body, 'fieldName1', 'fieldName2')).to.equal(2);
            done();
        });
    });
});