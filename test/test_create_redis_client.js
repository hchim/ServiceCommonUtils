/**
 * Created by huiche on 2/26/17.
 */
var assert = require('assert');
var expect = require('Chai').expect;
var utils = require('../index');

describe('createRedisClient functions', function () {
    it('should create redis client', function (done) {
        var client = utils.createRedisClient('127.0.0.1', 6379);
        expect(client).to.not.be.undefined;
        expect(client).to.not.be.null;
        client.set('test', 'teststr')
        client.get('test', function (err, reply) {
            expect(reply).to.equal('teststr')
            done()
        })
    })
})