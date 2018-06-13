'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var winston = require('winston');
var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');

AWS.config.loadFromPath(__dirname + '/s3Credential.json');

var uploadLogs = function uploadLogs(logDir, conf, s3Client) {
    fs.readdir(logDir, function (err, files) {
        if (err) {
            winston.log('error', 'Failed to read log dir: ' + logDir);
            return;
        }

        files.forEach(function (name) {
            if (name.endsWith('.log.gz')) {
                var filePath = path.join(logDir, name);
                var buffer = fs.readFileSync(filePath);
                var params = { Key: name, Body: buffer, ACL: 'private' };
                s3Client.upload(params, function (err, data) {
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

var LogUploader = exports.LogUploader = function () {
    function LogUploader(executeInterval, logDir, conf) {
        _classCallCheck(this, LogUploader);

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

    _createClass(LogUploader, [{
        key: 'start',
        value: function start() {
            if (this.isActive) {
                return;
            }

            winston.log('info', 'Start LogUploader: Execute interval: ' + this.executeInterval);
            this.timeout = setInterval(uploadLogs, this.executeInterval, this.logDir, this.conf, this.s3Client);
            this.isActive = true;
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this.timeout) {
                winston.log('info', 'Stop LogUploader.');
                clearInterval(this.timeout);
                this.isActive = false;
            }
        }
    }]);

    return LogUploader;
}();