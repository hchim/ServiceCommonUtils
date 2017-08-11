var mongoose = require('mongoose');
const winston = require('winston')

mongoose.Promise = require('bluebird');

function connectDB(conf) {
    var dbUrl = conf.get('mongodb.url');
    var env = conf.get('env');

    var options = {
        useMongoClient: true,
        auto_reconnect:true,
        socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 }
    };

    mongoose.connect(dbUrl, options, function (error) {
        if(error) {
            winston.log('error', 'Failed to connect to mongodb.', error);
            return;
        }

        if (env === 'development' || env === 'test') {
            mongoose.set('debug', true);
        }
    });

    mongoose.connection.on('disconnected', function(){
        winston.log('info', 'Lost MongoDB connection.');
        //Reconnect every 5 seconds.
        setTimeout(connectDB, 5000, conf);
    });

    mongoose.connection.on('connected', function() {
        winston.log('info', 'Connected to mongodb.');
    });

    mongoose.connection.once('open', function() {
        winston.log('info', 'Mongodb connection open.');
    });

    mongoose.connection.on('error', function() {
        winston.log('info', 'Could not connect to mongodb.');
        mongoose.disconnect();
    });

    mongoose.connection.on('reconnected', function() {
        winston.log('info', 'Reconnected to mongodb.');
    });
}

module.exports.connectDB = connectDB;