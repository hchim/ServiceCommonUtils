var redis = require('redis');
const winston = require('winston')
var AWS = require('aws-sdk');
var LogUploader = require('./LogUploader');
var MongooseHelper = require('./MongooseHelper');

module.exports = {
    LogUploader: LogUploader,
    /**
     * Function connect to mongodb.
     */
    connectDB: MongooseHelper.connectDB,
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
    nestedReqField: function (body, fieldName1, fieldName2) {
        var composedField = fieldName1 + '[' + fieldName2 + ']';
        //node.js request
        if (body[composedField]) {
            return body[composedField];
        } else if (body[fieldName1]) { //OKhttp
            return body[fieldName1][fieldName2];
        } else {
            return null
        }
    },
    /**
     * Return redis client, create it if was not created.
     * @param host
     * @param port
     */
    createRedisClient: function (host, port) {
        if (!this.redisClient) {
            var redisClient = redis.createClient(port, host);
            redisClient.on("error", function (err) {
                console.log("Create redis client Error: " + err);
            });
            redisClient.on("connect", function () {
                console.log('Connected to redis host: ' + host + ':' + port);
            });
            this.redisClient = redisClient;
        }
        return this.redisClient;
    },
    /**
     * Encode response body
     * @param res the json object to return
     */
    encodeResponseBody: function (req, json) {
        if (req.headers['is-internal-request'] === 'YES') {
            return json
        }

        var payload = new Buffer(JSON.stringify(json)).toString('base64')
        return {payload: payload}
    },
    /**
     * Decode the payload of the request body
     * @param req
     */
    decodeRequestBody: function (req) {
        var method = req.method.toLocaleLowerCase()
        if (method == 'put' || (method == 'post' && !req.is('multipart'))) {
            if (req.body.payload) {
                var buffer = new Buffer(req.body.payload, 'base64')
                var payload = buffer.toString('utf-8');
                var json = JSON.parse(payload);
                if (json) {
                    req.body = json;
                }
            }
        }
    },
    /**
     * Get winston obj and set the log level.
     * 1. If LOG_LEVEL env was set, it will use this log level.
     * 2. If env is production, log level is error
     * 3. otherwise, log level is debug
     * @param env
     */
    getWinston: function (env) {
        if (process.env.LOG_LEVEL) {
            winston.level = process.env.LOG_LEVEL
        } else {
            if (env === 'production')
                winston.level = 'info'
            else
                winston.level = 'debug'
        }

        return winston
    },
    /**
     * Create SES Client.
     * @param conf
     */
    createSESClient: function (conf) {
        if (!this.sesClient) {
            AWS.config.loadFromPath(__dirname + '/sesCredential.json');
            this.sesClient = new AWS.SES({apiVersion: 'latest'});
        }
        return this.sesClient;
    },
    /**
     * Send email.
     * @param ses
     * @param from
     * @param to
     * @param subject
     * @param body : html body
     * @param callback
     */
    sendEmail: function (ses, from, to, subject, body, callback) {
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
    },
    /**
     * Create a S3 client.
     * @param bucket
     * @returns {S3}
     */
    createS3Client: function (bucket) {
        if (!this.s3Client) {
            AWS.config.loadFromPath(__dirname + '/s3Credential.json');
            this.s3Client = new AWS.S3({
                apiVersion: '2006-03-01',
                params: {
                    Bucket: bucket
                }
            });
        }
        return this.s3Client;
    },
    /**
     * Return the common configs of all the services.
     */
    commonConfigs: require('./configs')
};
