'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nestedReqField = exports.decodeRequestBody = exports.encodeResponseBody = exports.sendEmail = exports.createSESClient = exports.createS3Client = exports.createRedisClient = exports.commonConfigs = exports.connectDB = exports.LogUploader = undefined;

var _LogUploader = require('./LogUploader');

var _MongooseHelper = require('./MongooseHelper');

var _CommonConfig = require('./CommonConfig');

var _CommonConfig2 = _interopRequireDefault(_CommonConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var redis = require('redis');
var winston = require('winston');
var AWS = require('aws-sdk');

/**
 * Retrieve the nested field of the request body.
 * OKHttp (Android client) and simple request (test) sends nested field in different format.
 *
 * OKHttp:  body.fieldName1.fieldName2
 * Simple request: body['fieldName1[fieldName2]']
 *
 * @param body request body
 * @param fieldName1
 * @param fieldName2
 * @returns {*}
 */
var nestedReqField = function nestedReqField(body, fieldName1, fieldName2) {
    var composedField = fieldName1 + '[' + fieldName2 + ']';
    //node.js request
    if (body[composedField]) {
        return body[composedField];
    } else if (body[fieldName1]) {
        //OKhttp
        return body[fieldName1][fieldName2];
    } else {
        return null;
    }
};

/**
 * Return redis client, create it if was not created.
 * @param host
 * @param port
 */
var createRedisClient = function createRedisClient(host, port) {
    var redisClient = redis.createClient(port, host);
    redisClient.on("error", function (err) {
        console.log("Create redis client Error: " + err);
    });
    redisClient.on("connect", function () {
        console.log('Connected to redis host: ' + host + ':' + port);
    });
    return redisClient;
};

/**
 * Encode response body
 * @param res the json object to return
 */
var encodeResponseBody = function encodeResponseBody(req, json) {
    if (req.headers['is-internal-request'] === 'YES') {
        return json;
    }

    var payload = new Buffer(JSON.stringify(json)).toString('base64');
    return { payload: payload };
};

/**
 * Decode the payload of the request body
 * @param req
 */
var decodeRequestBody = function decodeRequestBody(req) {
    var method = req.method.toLocaleLowerCase();
    if (method === 'put' || method === 'post' && !req.is('multipart')) {
        if (req.body.payload) {
            var buffer = new Buffer(req.body.payload, 'base64');
            var payload = buffer.toString('utf-8');
            var json = JSON.parse(payload);
            if (json) {
                req.body = json;
            }
        }
    }
};

/**
 * Get winston obj and set the log level.
 * 1. If LOG_LEVEL env was set, it will use this log level.
 * 2. If env is production, log level is error
 * 3. otherwise, log level is debug
 * @param env
 */
var getWinston = function getWinston(env) {
    if (process.env.LOG_LEVEL) {
        winston.level = process.env.LOG_LEVEL;
    } else {
        if (env === 'production') winston.level = 'info';else winston.level = 'debug';
    }

    return winston;
};

/**
 * Create SES Client.
 * @param conf
 */
var createSESClient = function createSESClient(conf) {
    AWS.config.loadFromPath(__dirname + '/sesCredential.json');
    return new AWS.SES({ apiVersion: 'latest' });
};

/**
 * Send email.
 * @param ses
 * @param from
 * @param to
 * @param subject
 * @param body : html body
 * @param callback
 */
var sendEmail = function sendEmail(ses, from, to, subject, body, callback) {
    ses.sendEmail({
        Source: from,
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Html: {
                    Data: body
                }
            }
        }
    }, function (err, data) {
        callback(err, data);
    });
};

/**
 * Create a S3 client.
 * @param bucket
 * @returns {S3}
 */
var createS3Client = function createS3Client(bucket) {
    AWS.config.loadFromPath(__dirname + '/s3Credential.json');
    return new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: bucket
        }
    });
};

exports.LogUploader = _LogUploader.LogUploader;
exports.connectDB = _MongooseHelper.connectDB;
exports.commonConfigs = _CommonConfig2.default;
exports.createRedisClient = createRedisClient;
exports.createS3Client = createS3Client;
exports.createSESClient = createSESClient;
exports.sendEmail = sendEmail;
exports.encodeResponseBody = encodeResponseBody;
exports.decodeRequestBody = decodeRequestBody;
exports.nestedReqField = nestedReqField;