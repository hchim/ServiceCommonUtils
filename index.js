var redis = require('redis');
const winston = require('winston')
var AWS = require('aws-sdk');

module.exports = {
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
     * Create redis client.
     * @param host
     * @param port
     */
    createRedisClient: function (host, port) {
        var redisClient = redis.createClient(port, host);
        redisClient.on("error", function (err) {
            console.log("Create redis client Error: " + err);
        });
        redisClient.on("connect", function () {
            console.log('Connected to redis host: ' + host + ':' + port);
        })
        return redisClient;
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
                winston.level = 'error'
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
        AWS.config.update({
            accessKeyId : conf.get('aws.ses.accessKeyId'),
            secretAccessKey : conf.get('aws.ses.secretAccessKey'),
            region : conf.get('aws.ses.region')
        });

        return new AWS.SES({apiVersion: 'latest'});
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
     * Return the common configs of all the services.
     */
    commonConfigs: function () {
        return {
            env: {
                doc: "The applicaton environment.",
                format: ["production", "development", "test"],
                default: "development",
                env: "NODE_ENV"
            },
            server: {
                ip: {
                    doc: "IP address to bind",
                    format: 'ipaddress',
                    default: '0.0.0.0',
                    env: "IP"
                },
                port: {
                    doc: "port to bind",
                    format: 'port',
                    default: 3000,
                    env: "PORT"
                },
                session: {
                    auth_token_expire: 30 * 24 * 60 * 60
                }
            },
            log: {
                dateformat: {
                    doc: "date format",
                    default: 'YYYY-MM-DD'
                },
                frequency: {
                    doc: 'the log file rotate frequency',
                    default: "daily"
                }
            },
            mongodb: {
                url: {
                    doc: "mongodb url",
                    "default": "mongodb://localhost/test"
                }
            },
            redis: {
                host: '127.0.0.1',
                port: 6379
            },
            endpoint: {
                metricservice: 'http://localhost:3112'
            },
            service: {
                name: 'Service' //service name, should be overriden
            },
            "upload_dir": {
                "doc": "Upload cache file directory",
                "default": "cache_files/"
            },
            "aws": {
                "s3": {
                    "header": {
                        "bucket": "sleeprecord-header",
                        "accessKeyId": "AKIAJUG7F5Z3ZLM45HLA",
                        "secretAccessKey": "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",
                        "region": "us-west-2"
                    }
                },
                "ses": {
                    "accessKeyId": "AKIAIOMOT34K6UYYW7CQ",
                    "secretAccessKey": "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",
                    "region": "us-west-2"
                }
            },
            "email": {
                "from_email": "aiden@sleepaiden.com"
            },
            "email_template": {
                "register": {
                    "subject": "Welcome to SleepRecord",
                    "html": "Hi %s,<br>Welcome to use SleepRecord.<br>Please input the code to verify your email: %s<br>Thanks<br>The SleepRecord Team"
                },
                "reset_email": {
                    "subject": "Reset your password",
                    "html": "Hi %s,<br>Please input this security code to reset your password: %s<br>Thanks<br>The SleepRecord Team"
                }
            },
            "google": {
                "client_id": "894802459298-3637204prl1d2vnce72bfjeptjivmg18.apps.googleusercontent.com",
                "secret": "AIzaSyDGvFHSmqeOVtLmz7s18SSbrLxMYDrzEEM"
            },
            "facebook": {
                "app_id": "1891279461107263",
                "secret": "aaa03e9f3f84ce950826fed305fa477d"
            },
            "wechat": {
                "app_id": "",
                "secret": ""
            }
        };
    }
};
