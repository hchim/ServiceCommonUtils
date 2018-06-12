/**
 * Created by huiche on 2/26/17.
 */
const assert = require('assert');
const expect = require('Chai').expect;

import {createRedisClient} from '../index';

describe('createRedisClient functions', () => {
    it('should create redis client', (done) => {
        var client = createRedisClient('127.0.0.1', 6379);
        expect(client).to.not.be.undefined;
        expect(client).to.not.be.null;
        client.set('test', 'teststr');
        client.get('test', (err, reply) => {
            expect(reply).to.equal('teststr');
            done();
        });
    });
});