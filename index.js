const redis = require('redis');
const winston = require('winston');
const AWS = require('aws-sdk');

import { LogUploader } from './LogUploader';
import {connectDB} from './MongooseHelper';
import commonConfigs from './CommonConfig';

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
const nestedReqField = (body, fieldName1, fieldName2) => {
    const composedField = fieldName1 + '[' + fieldName2 + ']';
    //node.js request
    if (body[composedField]) {
        return body[composedField];
    } else if (body[fieldName1]) { //OKhttp
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
const createRedisClient = (host, port) => {
    const redisClient = redis.createClient(port, host);
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
const encodeResponseBody = (req, json) => {
    if (req.headers['is-internal-request'] === 'YES') {
        return json;
    }

    const payload = new Buffer(JSON.stringify(json)).toString('base64')
    return {payload: payload};
};

/**
 * Decode the payload of the request body
 * @param req
 */
const decodeRequestBody = (req) => {
    const method = req.method.toLocaleLowerCase()
    if (method === 'put' || (method === 'post' && !req.is('multipart'))) {
        if (req.body.payload) {
            const buffer = new Buffer(req.body.payload, 'base64')
            const payload = buffer.toString('utf-8');
            const json = JSON.parse(payload);
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
const getWinston = (env) => {
    if (process.env.LOG_LEVEL) {
        winston.level = process.env.LOG_LEVEL
    } else {
        if (env === 'production')
            winston.level = 'info'
        else
            winston.level = 'debug'
    }

    return winston;
};

/**
 * Create SES Client.
 * @param conf
 */
const createSESClient = (conf) => {
    AWS.config.loadFromPath(__dirname + '/sesCredential.json');
    return new AWS.SES({apiVersion: 'latest'});
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
const sendEmail = (ses, from, to, subject, body, callback) => {
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
const createS3Client = (bucket) => {
    AWS.config.loadFromPath(__dirname + '/s3Credential.json');
    return new AWS.S3({
        apiVersion: '2006-03-01',
        params: {
            Bucket: bucket
        }
    });
};

export {
    LogUploader,
    connectDB,
    commonConfigs,
    createRedisClient,
    createS3Client,
    createSESClient,
    sendEmail,
    encodeResponseBody,
    decodeRequestBody,
    nestedReqField
};
