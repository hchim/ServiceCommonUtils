const winston = require('winston');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.loadFromPath(__dirname + '/s3Credential.json');

const uploadLogs = (logDir, conf, s3Client) => {
    fs.readdir(logDir, function (err, files) {
        if (err) {
            winston.log('error', 'Failed to read log dir: ' + logDir);
            return;
        }

        files.forEach(function (name) {
            if (name.endsWith('.log.gz')) {
                const filePath = path.join(logDir, name);
                const buffer = fs.readFileSync(filePath);
                const params = {Key: name, Body: buffer, ACL: 'private'};
                s3Client.upload(params, function(err, data) {
                    if (err) {
                        winston.log('error', 'Failed to upload file to s3: ' + name);
                        return;
                    }

                    fs.unlinkSync(filePath);
                    winston.log('info', 'Uploaded file to s3: ' + name);
                });
            }
        });
    });
};

/*
 * This class periodically upload the .log.gz files in the log directory to s3 bucket.
 */
export class LogUploader {
    constructor(executeInterval, logDir, conf) {
        this.isActive = false;
        this.executeInterval = executeInterval;
        this.logDir = logDir;
        this.conf = conf;
        this.s3Client = new AWS.S3({
            apiVersion: '2006-03-01',
            params: {
                Bucket: conf.get('aws.s3.logs.bucket')
            }
        });
    }

    start() {
        if (this.isActive) {
            return;
        }

        winston.log('info', 'Start LogUploader: Execute interval: ' + this.executeInterval);
        this.timeout = setInterval(uploadLogs, this.executeInterval, this.logDir, this.conf, this.s3Client);
        this.isActive = true;
    }

    stop() {
        if (this.timeout) {
            winston.log('info', 'Stop LogUploader.');
            clearInterval(this.timeout);
            this.isActive = false;
        }
    }
}