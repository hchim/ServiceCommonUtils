var LogUploader = require('../LogUploader')
var fs = require('fs');
var assert = require('assert');
var expect = require('Chai').expect;
var convict = require('convict');

var conf = convict({
    aws: {
        s3: {
            logs: {
                bucket: "sleepaiden-logs"
            }
        }
    }
})

describe('Upload log to s3 bucket', function () {
    it('Upload and delete the file.', function (done) {
        var file = Date.getTime() + 'test.log.gz'
        fs.writeFile(file, 'Test file.', null)
        var uploader = new LogUploader(5000, '.', conf)

        uploader.start()

        setTimeout(function () {
            uploader.stop()
            expect(fs.existsSync(file)).to.equal(false)
            done()
        }, 10000)
    }).timeout(20000)
})