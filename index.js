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
        } else { //OKhttp
            return body[fieldName1][fieldName2];
        }
    }
};
