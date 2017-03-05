var redis = require('redis');
var metric = require('metricsclient')

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
            metric.errorMetric('IdentityService:Error:redis', err, function (err, res) {
                //nothing
            })
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
    }
};
