var winston = require('winston');
var AWS = require('aws-sdk');
var fs = require('fs');
const path = require('path');

AWS.config.loadFromPath('./s3Credential.json');

var uploadLogs = function (logDir, conf, s3Client) {
    fs.readdir(logDir, function (err, files) {
        if (err) {
            winston.log('error', 'Failed to read log dir: ' + logDir)
            return
        }

        files.forEach(function (name) {
            if (name.endsWith('.log.gz')) {
                var filePath = path.join(logDir, name)
                var buffer = fs.readFileSync(filePath)
                var params = {Key: name, Body: buffer, ACL: 'private'};
                s3Client.upload(params, function(err, data) {
                    if (err) {
                        winston.log('error', 'Failed to upload file to s3: ' + name)
                        return
                    }
                    fs.unlinkSync(filePath)
                    winston.log('info', 'Uploaded file to s3: ' + name)
                });
            }
        });
    })
}

/**
 * This class periodically upload the .log.gz files in the log directory to s3 bucket.
 * @param executeInterval
 * @param logDir
 * @param conf
 * @constructor
 */
var LogUploader = function (executeInterval, logDir, conf) {
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

LogUploader.prototype.start = function () {
    if (this.isActive) {
        return;
    }

    winston.log('info', 'Start LogUploader: Execute interval: ' + this.executeInterval);
    this.timeout = setInterval(uploadLogs, this.executeInterval, this.logDir, this.conf, this.s3Client);
    this.isActive = true;
};

LogUploader.prototype.stop = function () {
    if (this.timeout) {
        winston.log('info', 'Stop LogUploader.');
        clearInterval(this.timeout);
        this.isActive = false;
    }
};

module.exports = LogUploader;