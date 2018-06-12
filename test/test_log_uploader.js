import {LogUploader} from '../index';

const fs = require('fs');
const assert = require('assert');
const expect = require('Chai').expect;
const convict = require('convict');

const conf = convict({
    aws: {
        s3: {
            logs: {
                bucket: "sleepaiden-logs"
            }
        }
    }
});

describe('Upload log to s3 bucket', () => {
    it('Upload and delete the file.', (done) => {
        const file = new Date().getTime() + 'test.log.gz';
        fs.writeFile(file, 'Test file.', () => {});
        const uploader = new LogUploader(5000, '.', conf);

        uploader.start();

        setTimeout(() => {
            uploader.stop();
            expect(fs.existsSync(file)).to.equal(false);
            done();
        }, 10000);
    }).timeout(20000);
});